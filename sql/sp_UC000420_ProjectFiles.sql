/*
  sp_UC000420_ProjectFiles  --  the project's five file tabs (Area Map, Area Report, Presentation, Project Layout, Zoning).

  EXEC dbo.sp_UC000420_ProjectFiles @Action, @Kind, @MaalemDubaiRef, ...

  @Kind (allow-listed; the tab name works as it is written in the app, e.g. 'Area Map')      table
    areaMap                 UC000420_Files_AreaMap
    areaReport              UC000420_Files_AreaReport
    presentation            UC000420_Files_Presentation
    projectLayout           UC000420_Files_ProjectLayout
    zoning                  UC000420_Files_Zoning

  @Action
    list        the project's files, newest first (set @IsActive to 1 / 0 to get only the active / in-active ones).
                Needs @MaalemDubaiRef.                                              -> FileID, FileName, DocumentumID, ... , IsActive
    add         a new upload: the file becomes the ACTIVE one and the project's earlier active file of this kind becomes
                in-active, in one transaction. Needs @MaalemDubaiRef and @FileName. The file itself stays in SharePoint (opened by
                its path <project ref>/<tab>/<file name>); only the name is stored here. @DocumentumID (optional) can hold the SharePoint
                file Identifier, @DocuFileName the name kept in SharePoint (defaults to @FileName).   -> FileID
    setActive   make one file active (the project's others of this kind become in-active) or in-active.
                Needs @FileID and @IsActive.                                         -> FileID, RowsAffected

  Plain CRUD on the same tables (create / update / get / list / delete / setActive and the bulk ones) is also available through
  sp_UC000420_Crud with the entities fileAreaMap, fileAreaReport, fileConImage, fileDevImage, fileImage, fileIssue, filePlot,
  filePPR, filePresentation, fileProjectLayout, filePTPReply and fileZoning.

  Safe: the table name only comes from the allow-list above, every value goes in as a parameter. Writes roll back on any error.
  Assumes FileID is an IDENTITY column. If it is not, tell me and add FileID to the INSERT.
  Permissions: the login needs EXECUTE here and SELECT / INSERT / UPDATE on the five tables (dynamic SQL).
  Errors: 51101 action / kind missing or unknown, 51102 required value missing, 51103 no file with that FileID.
*/
USE [Microsoft_PP_Projects_Dev]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ProjectFiles]
  @Action          nvarchar(20),
  @Kind            nvarchar(30),
  @MaalemDubaiRef  nvarchar(100) = NULL,
  @FileID          bigint = NULL,
  @FileName        nvarchar(500) = NULL,
  @DocumentumID    nvarchar(500) = NULL,
  @DocuFileName    nvarchar(500) = NULL,
  @IsActive        bit = NULL,
  @User            nvarchar(255) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  -- "Area Map", "area map", "AreaMap" and "areaMap" are the same kind (spaces are ignored, letter case does not matter)
  SET @Kind = REPLACE(REPLACE(LTRIM(RTRIM(@Kind)), N' ', N''), N'_', N'');
  DECLARE @table sysname = CASE @Kind
      WHEN N'areaMap'       THEN N'UC000420_Files_AreaMap'
      WHEN N'areaReport'    THEN N'UC000420_Files_AreaReport'
      WHEN N'presentation'  THEN N'UC000420_Files_Presentation'
      WHEN N'projectLayout' THEN N'UC000420_Files_ProjectLayout'
      WHEN N'zoning'        THEN N'UC000420_Files_Zoning'
      ELSE NULL END;
  IF @Action IS NULL OR @Action NOT IN (N'list', N'add', N'setActive') OR @table IS NULL THROW 51101, 'action must be list, add or setActive and kind one of areaMap, areaReport, presentation, projectLayout, zoning', 1;
  DECLARE @t nvarchar(300) = N'dbo.' + QUOTENAME(@table);
  DECLARE @who nvarchar(255) = ISNULL(NULLIF(@User, N''), ORIGINAL_LOGIN());
  DECLARE @sql nvarchar(max);

  IF @Action = N'list'
  BEGIN
    IF @MaalemDubaiRef IS NULL THROW 51102, 'maalemDubaiRef is required', 1;
    SET @sql = N'SELECT FileID, FileName, MaalemDubaiRef, DocumentumID, DocuFileName, uploaded_by, uploaded_at, updated_by, updated_at, IsActive
                 FROM ' + @t + N' WHERE MaalemDubaiRef = @ref AND (@act IS NULL OR IsActive = @act) ORDER BY uploaded_at DESC, FileID DESC';
    EXEC sys.sp_executesql @sql, N'@ref nvarchar(100), @act bit', @ref = @MaalemDubaiRef, @act = @IsActive;
    RETURN;
  END

  BEGIN TRAN;

  IF @Action = N'add'
  BEGIN
    IF @MaalemDubaiRef IS NULL OR @FileName IS NULL THROW 51102, 'maalemDubaiRef and fileName are required', 1;
    SET @sql = N'UPDATE ' + @t + N' SET IsActive = 0, updated_by = @who, updated_at = SYSUTCDATETIME() WHERE MaalemDubaiRef = @ref AND IsActive = 1;
                 INSERT INTO ' + @t + N' (FileName, MaalemDubaiRef, DocumentumID, DocuFileName, uploaded_by, uploaded_at, IsActive, updated_by, updated_at)
                 OUTPUT inserted.FileID
                 VALUES (@name, @ref, @doc, @docname, @who, SYSUTCDATETIME(), 1, @who, SYSUTCDATETIME());';
    EXEC sys.sp_executesql @sql, N'@who nvarchar(255), @ref nvarchar(100), @name nvarchar(500), @doc nvarchar(500), @docname nvarchar(500)',
         @who = @who, @ref = @MaalemDubaiRef, @name = @FileName, @doc = @DocumentumID, @docname = ISNULL(@DocuFileName, @FileName);
    COMMIT;
    RETURN;
  END

  -- setActive
  IF @FileID IS NULL OR @IsActive IS NULL THROW 51102, 'fileID and isActive are required', 1;
  SET @sql = N'DECLARE @ref nvarchar(100) = (SELECT MaalemDubaiRef FROM ' + @t + N' WHERE FileID = @id);
               IF @ref IS NULL THROW 51103, ''No file with that FileID'', 1;
               IF @act = 1 UPDATE ' + @t + N' SET IsActive = 0, updated_by = @who, updated_at = SYSUTCDATETIME() WHERE MaalemDubaiRef = @ref AND IsActive = 1 AND FileID <> @id;
               UPDATE ' + @t + N' SET IsActive = @act, updated_by = @who, updated_at = SYSUTCDATETIME() WHERE FileID = @id;
               SELECT @id AS FileID, @@ROWCOUNT AS RowsAffected;';
  EXEC sys.sp_executesql @sql, N'@id bigint, @act bit, @who nvarchar(255)', @id = @FileID, @act = @IsActive, @who = @who;
  COMMIT;
END
GO

/* Try it:
EXEC dbo.sp_UC000420_ProjectFiles @Action = N'list', @Kind = N'areaMap', @MaalemDubaiRef = N'MP-00000-114';
*/
