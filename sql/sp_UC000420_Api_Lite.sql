/*
  sp_UC000420_Api_Lite  --  three-action version of the dispatcher, for testing the Power Automate flow.
    ViewProjDetails   {"maalemDubaiRef":"MP-99846-100"}                       -> 1 result set
    ViewProjFiles_SO  {"maalemDubaiRef":"MP-99846-100"}                       -> 7 result sets
    SearchPlots       {"pageSize":20,"pageNumber":1,"developerID":5,"orderBy":"PLT.created_at","sort":"DESC"} -> paged list
  SearchPlots keys: projectName, maalemDubaiRef, devPlotNum, dmPlotNum, initDEWASubFullName, initDEWASubSCADAName,
  developerName, developerID, consultantName, consultantID (all optional).
  Errors: 50001 action missing, 50002 invalid JSON, 50003 required key missing, 50004 bad orderBy, 50005 bad sort,
  50006 bad pageSize, 50007 bad pageNumber, 50099 unknown action.
*/
USE [Microsoft_PP_Projects_Dev]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_Api_Lite]
  @action nvarchar(100),
  @json   nvarchar(max) = N'{}'
AS
BEGIN
  SET NOCOUNT ON;

  IF @action IS NULL OR @action = N'' THROW 50001, 'action is required', 1;
  SET @json = ISNULL(NULLIF(LTRIM(RTRIM(@json)), N''), N'{}');
  IF ISJSON(@json) = 0 THROW 50002, 'json is not valid JSON', 1;

  -- Sort column: letters, digits, underscore and dot only (e.g. PLT.created_at); blocks injection through ORDER BY.
  DECLARE @orderBy nvarchar(255) = JSON_VALUE(@json,'$.orderBy');
  IF @orderBy IS NOT NULL AND @orderBy LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'orderBy contains invalid characters', 1;
  -- Sort direction: ASC or DESC only.
  DECLARE @sort nvarchar(10) = UPPER(JSON_VALUE(@json,'$.sort'));
  IF @sort IS NOT NULL AND @sort NOT IN (N'ASC', N'DESC') THROW 50005, 'sort must be ASC or DESC', 1;
  DECLARE @pageSize   int = ISNULL(TRY_CAST(JSON_VALUE(@json,'$.pageSize') AS int), 20);
  DECLARE @pageNumber int = ISNULL(TRY_CAST(JSON_VALUE(@json,'$.pageNumber') AS int), 1);
  IF @pageSize NOT BETWEEN 1 AND 500 THROW 50006, 'pageSize must be between 1 and 500', 1;
  IF @pageNumber < 1 THROW 50007, 'pageNumber must be 1 or more', 1;

  -- JSON values as variables (T-SQL does not allow function calls as EXEC arguments).
  DECLARE @j_ConsultantID_i int = TRY_CAST(JSON_VALUE(@json,'$.consultantID') AS int);
  DECLARE @j_ConsultantName nvarchar(2000) = JSON_VALUE(@json,'$.consultantName');
  DECLARE @j_DMPlotNum nvarchar(2000) = JSON_VALUE(@json,'$.dmPlotNum');
  DECLARE @j_DevPlotNum nvarchar(2000) = JSON_VALUE(@json,'$.devPlotNum');
  DECLARE @j_DeveloperID_i int = TRY_CAST(JSON_VALUE(@json,'$.developerID') AS int);
  DECLARE @j_DeveloperName nvarchar(2000) = JSON_VALUE(@json,'$.developerName');
  DECLARE @j_InitDEWASubFullName nvarchar(2000) = JSON_VALUE(@json,'$.initDEWASubFullName');
  DECLARE @j_InitDEWASubSCADAName nvarchar(2000) = JSON_VALUE(@json,'$.initDEWASubSCADAName');
  DECLARE @j_MaalemDubaiRef nvarchar(2000) = JSON_VALUE(@json,'$.maalemDubaiRef');
  DECLARE @j_ProjectName nvarchar(2000) = JSON_VALUE(@json,'$.projectName');

  IF @action = N'ViewProjDetails'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjDetails: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjDetails
      @MaalemDubaiRef = @j_MaalemDubaiRef;
    RETURN;
  END

  IF @action = N'ViewProjFiles_SO'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjFiles_SO: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjFiles_SO
      @MaalemDubaiRef = @j_MaalemDubaiRef;
    RETURN;
  END

  IF @action = N'SearchPlots'
  BEGIN
    EXEC dbo.sp_UC000420_SearchPlots
      @ProjectName = @j_ProjectName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DevPlotNum = @j_DevPlotNum,
      @DMPlotNum = @j_DMPlotNum,
      @InitDEWASubFullName = @j_InitDEWASubFullName,
      @InitDEWASubSCADAName = @j_InitDEWASubSCADAName,
      @DeveloperName = @j_DeveloperName,
      @DeveloperID = @j_DeveloperID_i,
      @ConsultantName = @j_ConsultantName,
      @ConsultantID = @j_ConsultantID_i,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  ;THROW 50099, 'Unknown action', 1;
END
GO

/* Smoke tests (use a real MaalemDubaiRef):
EXEC dbo.sp_UC000420_Api_Lite N'ViewProjDetails',  N'{"maalemDubaiRef":"MP-99846-100"}';
EXEC dbo.sp_UC000420_Api_Lite N'ViewProjFiles_SO', N'{"maalemDubaiRef":"MP-99846-100"}';
EXEC dbo.sp_UC000420_Api_Lite N'SearchPlots',      N'{"pageSize":5,"pageNumber":1}';
EXEC dbo.sp_UC000420_Api_Lite N'Nope',             N'{}';   -- expect error 50099
*/
