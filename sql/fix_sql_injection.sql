/*
  fix_sql_injection.sql  --  stops text values from being pasted into dynamic SQL.

  WHAT WAS WRONG
    The Search* / View* procedures built their query as text and joined the caller's values into it, e.g.
        WHERE MaalemDubaiRef = ''' + @MaalemDubaiRef + ''''
        AND MPT.ProjectName LIKE ''%' + @ProjectName + '%'''
    A value such as   x' OR 1=1 --   became part of the query (SQL injection).

  WHAT THIS SCRIPT DOES
    Each procedure below is re-created with CREATE OR ALTER so the value stays a PARAMETER of sp_executesql
    (they already declared and passed every value; the text just was not using them):
        WHERE MaalemDubaiRef = @MaalemDubaiRef
        AND MPT.ProjectName LIKE '%' + @ProjectName + '%'
    Also: created_at / created_by column names (the old dump still had the ALTERd_at / ALTERd_by typos), and a guard
    that rejects an unsafe @OrderByColumn / @SortType (the dispatcher already does the same).

  BEFORE YOU RUN IT
    1. Run it in the DEV database first (Microsoft_PP_Projects_Dev).
    2. The definitions come from the db.md dump of 10/14/2026. If any of these procedures was changed in the database after
       that, script out the current version first (SSMS: right-click the procedure > Script Stored Procedure as > ALTER To)
       and compare, so a later edit is not overwritten. Keep those files for rollback.
    3. Then run sql/sp_UC000420_Api.sql (the dispatcher): it now also accepts "createdBy".

  AFTER
    Flow test page > "6 / SQL injection check" must pass (read-only: it sends   x' OR 1=1 --   and expects no rows).

  Procedures changed: 32
*/
USE [Microsoft_PP_Projects_Dev]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ===== sp_UC000420_SearchConsultants =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants]
  @ConsultantName        nvarchar(255)		= NULL,
  @OrderByColumn         nvarchar(255)		= NULL,
  @SortType              nvarchar(255)		= NULL,
  @PageSize              int				= NULL,
  @PageNumber            int				= NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT [ConsultantID]
      ,[ConsultantName]
      ,[ConsultantURL]
      ,[IsActive]
      ,[created_at]
      ,[created_by]
      ,[updated_at]
      ,[updated_by]
	  ,[FileID]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] WHERE 1 = 1'
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN
        N' AND ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' ConsultantName' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantName        nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantName,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_SearchConsultants_Count =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants_Count]
  @ConsultantName        nvarchar(255)		= NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(*) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] WHERE 1 = 1'
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN
        N' AND ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
      + N';';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantName        nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantName

END
GO

-- ===== sp_UC000420_SearchConsultants_SO =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants_SO]
  @ConsultantName        nvarchar(255)		= NULL,
  @OrderByColumn         nvarchar(255)		= NULL,
  @SortType              nvarchar(255)		= NULL,
  @PageSize              int				= NULL,
  @PageNumber            int				= NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT [ConsultantID]
      ,[ConsultantName]
      ,[ConsultantURL]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] WHERE [IsActive] = 1'
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN
        N' AND ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' ConsultantName' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantName        nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantName,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_SearchDevelopers =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers]
  @DeveloperName         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT [DeveloperID]
      ,[DeveloperName]
      ,[DeveloperURL]
      ,[IsActive]
      ,[created_at]
      ,[created_by]
      ,[updated_at]
      ,[updated_by]
	  ,[FileID]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] WHERE 1 = 1'
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN
        N' AND DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' DeveloperName' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperName         nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperName,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_SearchDevelopers_Count =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers_Count]
  @DeveloperName         nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(*) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] WHERE 1 = 1'
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN
        N' AND DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
      + N' ;';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperName         nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperName

END
GO

-- ===== sp_UC000420_SearchDevelopers_SO =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers_SO]
  @DeveloperName         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT [DeveloperID]
      ,[DeveloperName]
      ,[DeveloperURL]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers]
	  WHERE [IsActive] = 1'
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN
        N' AND DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' DeveloperName' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperName         nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperName,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_SearchPlots =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots]
  @ProjectName            nvarchar(255)  = NULL,
  @MaalemDubaiRef         nvarchar(255)  = NULL,
  @DevPlotNum              nvarchar(255)  = NULL,
  @DMPlotNum               nvarchar(255)  = NULL,
  @InitDEWASubFullName           nvarchar(255)  = NULL,
  @InitDEWASubSCADAName         nvarchar(255)  = NULL,
  @DeveloperName          nvarchar(255)  = NULL,
  @DeveloperID			  int  = NULL,
  @ConsultantName         nvarchar(255)  = NULL,
  @ConsultantID           int  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT PLT.[RowID]
      ,PLT.[DevPlotNum]
      ,PLT.[DMPlotNum]
      ,PLT.[LandUse]
      ,MPT.[ProjectName]
      ,MPT.[MaalemDubaiRef]
	    ,DEV.[DeveloperID]
      ,DEV.[DeveloperName]
	    ,CON.[ConsultantID]
      ,CON.[ConsultantName]
	  ,PLT.[IsActive]
      ,PLT.[created_at]
      ,PLT.[created_by]
	  ,CONCAT(''https://bayanat.dewa.gov.ae/asas/?query=ASAS_9839_3,PARCELID,'', PLT.DMPlotNum) AS GISUrl
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%'' + @DevPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%'' + @DMPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubFullName + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%'' + @InitDEWASubSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' GROUP BY PLT.[RowID],PLT.[DevPlotNum],PLT.[DMPlotNum],PLT.[LandUse],MPT.[ProjectName],MPT.[MaalemDubaiRef],DEV.[DeveloperID],DEV.[DeveloperName],CON.[ConsultantID],CON.[ConsultantName],PLT.[IsActive],PLT.[created_at],PLT.[created_by]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PLT.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' DESC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @ProjectName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DevPlotNum              nvarchar(255),
      @DMPlotNum               nvarchar(255),
      @InitDEWASubFullName           nvarchar(255),
      @InitDEWASubSCADAName         nvarchar(255),
      @DeveloperName          nvarchar(255),
	  @DeveloperID			  int,
      @ConsultantName         nvarchar(255),
	  @ConsultantID			  int,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @ProjectName,
      @MaalemDubaiRef,
      @DevPlotNum,
      @DMPlotNum,
      @InitDEWASubFullName,
      @InitDEWASubSCADAName,
      @DeveloperName,
	  @DeveloperID,
      @ConsultantName,
	  @ConsultantID,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_SearchPlots_Count =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots_Count]
  @ProjectName            nvarchar(255)  = NULL,
  @MaalemDubaiRef         nvarchar(255)  = NULL,
  @DevPlotNum              nvarchar(255)  = NULL,
  @DMPlotNum               nvarchar(255)  = NULL,
  @InitDEWASubFullName           nvarchar(255)  = NULL,
  @InitDEWASubSCADAName         nvarchar(255)  = NULL,
  @DeveloperName          nvarchar(255)  = NULL,
  @DeveloperID			  int  = NULL,
  @ConsultantName         nvarchar(255)  = NULL,
  @ConsultantID           int  = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(*) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%'' + @DevPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%'' + @DMPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubFullName + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N';';
 

    DECLARE @params nvarchar(max) = N'
      @ProjectName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DevPlotNum              nvarchar(255),
      @DMPlotNum               nvarchar(255),
      @InitDEWASubFullName           nvarchar(255),
      @InitDEWASubSCADAName         nvarchar(255),
      @DeveloperName          nvarchar(255),
	  @DeveloperID			  int,
      @ConsultantName         nvarchar(255),
	  @ConsultantID			  int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @ProjectName,
      @MaalemDubaiRef,
      @DevPlotNum,
      @DMPlotNum,
      @InitDEWASubFullName,
      @InitDEWASubSCADAName,
      @DeveloperName,
	  @DeveloperID,
      @ConsultantName,
	  @ConsultantID

END
GO

-- ===== sp_UC000420_SearchPlots_SO =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots_SO]
  @ProjectName            nvarchar(255)  = NULL,
  @MaalemDubaiRef         nvarchar(255)  = NULL,
  @DevPlotNum              nvarchar(255)  = NULL,
  @DMPlotNum               nvarchar(255)  = NULL,
  @InitDEWASubFullName           nvarchar(255)  = NULL,
  @InitDEWASubSCADAName         nvarchar(255)  = NULL,
  @DeveloperName          nvarchar(255)  = NULL,
  @DeveloperID			  int  = NULL,
  @ConsultantName         nvarchar(255)  = NULL,
  @ConsultantID           int  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT PLT.[RowID]
      ,PLT.[DevPlotNum]
      ,PLT.[DMPlotNum]
      ,PLT.[LandUse]
      ,MPT.[ProjectName]
      ,MPT.[MaalemDubaiRef]
      ,DEV.[DeveloperName]
      ,CON.[ConsultantName]
	  ,PLT.[created_at]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE PLT.[IsActive] = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%'' + @DevPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%'' + @DMPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubFullName + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%'' + @InitDEWASubSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' GROUP BY PLT.[RowID],PLT.[DevPlotNum],PLT.[DMPlotNum],PLT.[LandUse],MPT.[ProjectName],MPT.[MaalemDubaiRef],DEV.[DeveloperName],CON.[ConsultantName],PLT.[created_at]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PLT.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' DESC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @ProjectName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DevPlotNum              nvarchar(255),
      @DMPlotNum               nvarchar(255),
      @InitDEWASubFullName           nvarchar(255),
      @InitDEWASubSCADAName         nvarchar(255),
      @DeveloperName          nvarchar(255),
	  @DeveloperID			  int,
      @ConsultantName         nvarchar(255),
	  @ConsultantID			  int,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @ProjectName,
      @MaalemDubaiRef,
      @DevPlotNum,
      @DMPlotNum,
      @InitDEWASubFullName,
      @InitDEWASubSCADAName,
      @DeveloperName,
	  @DeveloperID,
      @ConsultantName,
	  @ConsultantID,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_SearchProjects =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects]
  @ProjectName            nvarchar(255)  = NULL,
  @MaalemDubaiRef         nvarchar(255)  = NULL,
  @DevPlotNum              nvarchar(255)  = NULL,
  @DMPlotNum               nvarchar(255)  = NULL,
  @InitDEWASubFullName           nvarchar(255)  = NULL,
  @InitDEWASubSCADAName         nvarchar(255)  = NULL,
  @DeveloperName          nvarchar(255)  = NULL,
  @DeveloperID			  int  = NULL,
  @ConsultantName         nvarchar(255)  = NULL,
  @ConsultantID           int  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT MPT.[ProjectName]
      ,MPT.[MaalemDubaiRef]
	  ,DEV.[DeveloperID]
      ,DEV.[DeveloperName]
      ,MPT.[created_at]
      ,MPT.[created_by]
	  ,MPT.[IsActive]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT LEFT JOIN 
		    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID LEFT JOIN
	    	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%'' + @DevPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%'' + @DMPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubFullName + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%'' + @InitDEWASubSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' GROUP BY MPT.[ProjectName], MPT.[MaalemDubaiRef], DEV.[DeveloperID], DEV.[DeveloperName], MPT.[created_at], MPT.[created_by], MPT.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' MPT.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @ProjectName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DevPlotNum              nvarchar(255),
      @DMPlotNum               nvarchar(255),
      @InitDEWASubFullName           nvarchar(255),
      @InitDEWASubSCADAName         nvarchar(255),
      @DeveloperName          nvarchar(255),
	  @DeveloperID			  int,
      @ConsultantName         nvarchar(255),
	  @ConsultantID			  int,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @ProjectName,
      @MaalemDubaiRef,
      @DevPlotNum,
      @DMPlotNum,
      @InitDEWASubFullName,
      @InitDEWASubSCADAName,
      @DeveloperName,
	  @DeveloperID,
      @ConsultantName,
	  @ConsultantID,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_SearchProjects_Count =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects_Count]
  @ProjectName            nvarchar(255)  = NULL,
  @MaalemDubaiRef         nvarchar(255)  = NULL,
  @DevPlotNum              nvarchar(255)  = NULL,
  @DMPlotNum               nvarchar(255)  = NULL,
  @InitDEWASubFullName           nvarchar(255)  = NULL,
  @InitDEWASubSCADAName         nvarchar(255)  = NULL,
  @DeveloperName          nvarchar(255)  = NULL,
  @DeveloperID			  int  = NULL,
  @ConsultantName         nvarchar(255)  = NULL,
  @ConsultantID           int  = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(DISTINCT MPT.[MaalemDubaiRef]) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT LEFT JOIN 
		    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID LEFT JOIN
	    	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%'' + @DevPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%'' + @DMPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubFullName + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' ;';
 

    DECLARE @params nvarchar(max) = N'
      @ProjectName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DevPlotNum              nvarchar(255),
      @DMPlotNum               nvarchar(255),
      @InitDEWASubFullName           nvarchar(255),
      @InitDEWASubSCADAName         nvarchar(255),
      @DeveloperName          nvarchar(255),
	  @DeveloperID			  int,
      @ConsultantName         nvarchar(255),
	  @ConsultantID         int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @ProjectName,
      @MaalemDubaiRef,
      @DevPlotNum,
      @DMPlotNum,
      @InitDEWASubFullName,
      @InitDEWASubSCADAName,
      @DeveloperName,
	  @DeveloperID,
      @ConsultantName,
	  @ConsultantID

END
GO

-- ===== sp_UC000420_SearchProjects_SO =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects_SO]
  @ProjectName            nvarchar(255)  = NULL,
  @MaalemDubaiRef         nvarchar(255)  = NULL,
  @DevPlotNum              nvarchar(255)  = NULL,
  @DMPlotNum               nvarchar(255)  = NULL,
  @InitDEWASubFullName           nvarchar(255)  = NULL,
  @InitDEWASubSCADAName         nvarchar(255)  = NULL,
  @DeveloperName          nvarchar(255)  = NULL,
  @DeveloperID			  int  = NULL,
  @ConsultantName         nvarchar(255)  = NULL,
  @ConsultantID           int  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT MPT.[ProjectName]
      ,MPT.[MaalemDubaiRef]
      ,DEV.[DeveloperName]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT LEFT JOIN 
		    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID LEFT JOIN
	    	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE MPT.[IsActive] = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%'' + @DevPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%'' + @DMPlotNum + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubFullName + ''%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%'' + @InitDEWASubSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%'' + @DeveloperName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' GROUP BY MPT.[ProjectName], MPT.[MaalemDubaiRef], DEV.[DeveloperName], MPT.[created_at]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' MPT.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @ProjectName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DevPlotNum              nvarchar(255),
      @DMPlotNum               nvarchar(255),
      @InitDEWASubFullName           nvarchar(255),
      @InitDEWASubSCADAName         nvarchar(255),
      @DeveloperName          nvarchar(255),
	  @DeveloperID			  int,
      @ConsultantName         nvarchar(255),
	  @ConsultantID			  int,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @ProjectName,
      @MaalemDubaiRef,
      @DevPlotNum,
      @DMPlotNum,
      @InitDEWASubFullName,
      @InitDEWASubSCADAName,
      @DeveloperName,
	  @DeveloperID,
      @ConsultantName,
	  @ConsultantID,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_SearchSubstations =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations]
  @SubstationName          nvarchar(255)  = NULL,
  @SubstationSCADAName         nvarchar(255)  = NULL,
  @BuiltBy              nvarchar(255)  = NULL,
  @LimitAmount			  int  = NULL,
  @LimitDesc         nvarchar(255)  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
	SELECT SUB.[SubstationID]
      ,SUB.[SubstationName]
	  ,SUB.[SubstationSCADAName]
	  ,SUB.[BuiltBy]
	  /*,LKL.[LimitAmount]
	  ,LKL.[LimitDesc]*/
      ,SUB.[IsActive]
      ,SUB.[created_at]
      ,SUB.[created_by]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB FULL OUTER JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBL ON SUBL.[SubstationID] = SUB.[SubstationID] /*LEFT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] LKL ON LKL.LimitID = SUBL.LimitID*/
      WHERE 1 = 1'
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%'' + @SubstationName + ''%''' ELSE N'' END
      + CASE WHEN @SubstationSCADAName IS NOT NULL AND @SubstationSCADAName <> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%'' + @SubstationSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND @BuiltBy <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%'' + @BuiltBy + ''%''' ELSE N'' END
      /*+ CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%'' + @LimitDesc + ''%''' ELSE N'' END*/
	    /*+ COALESCE(CASE WHEN @LimitAmount IS NOT NULL AND @LimitAmount <> 0 THEN N' AND LKL.[LimitAmount] = ' + CAST(@LimitAmount AS nvarchar(255)) END, '')*/

	    + N' GROUP BY SUB.[SubstationID],SUB.[SubstationName],SUB.[SubstationSCADAName],SUB.[BuiltBy],SUB.[IsActive],SUB.[created_at],SUB.[created_by]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' SUB.[created_by]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @SubstationName            nvarchar(255),
      @SubstationSCADAName         nvarchar(255),
      @BuiltBy              nvarchar(255),
	  @LimitAmount			  int,
      @LimitDesc         nvarchar(255),
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @SubstationName,
      @SubstationSCADAName,
      @BuiltBy,
      @LimitAmount,
      @LimitDesc,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_SearchSubstations_Count =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations_Count]
  @SubstationName          nvarchar(255)  = NULL,
  @SubstationSCADAName         nvarchar(255)  = NULL,
  @BuiltBy              nvarchar(255)  = NULL,
  @LimitAmount			  int  = NULL,
  @LimitDesc         nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(DISTINCT SUB.[SubstationID]) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB FULL OUTER JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBL ON SUBL.[SubstationID] = SUB.[SubstationID] LEFT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] LKL ON LKL.LimitID = SUBL.LimitID
      WHERE 1 = 1 AND SUB.[SubstationName] IS NOT NULL'
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%'' + @SubstationName + ''%''' ELSE N'' END
      + CASE WHEN @SubstationSCADAName IS NOT NULL AND @SubstationSCADAName <> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%'' + @SubstationSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND @BuiltBy <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%'' + @BuiltBy + ''%''' ELSE N'' END
      + CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%'' + @LimitDesc + ''%''' ELSE N'' END

	    + N';';
 

    DECLARE @params nvarchar(max) = N'
      @SubstationName            nvarchar(255),
      @SubstationSCADAName         nvarchar(255),
      @BuiltBy              nvarchar(255),
	  @LimitAmount			  int,
      @LimitDesc         nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
      @SubstationName,
      @SubstationSCADAName,
      @BuiltBy,
      @LimitAmount,
      @LimitDesc

END
GO

-- ===== sp_UC000420_SearchSubstations_SO =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations_SO]
  @SubstationName          nvarchar(255)  = NULL,
  @SubstationSCADAName         nvarchar(255)  = NULL,
  @BuiltBy              nvarchar(255)  = NULL,
  @LimitAmount			  int  = NULL,
  @LimitDesc         nvarchar(255)  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
	SELECT SUB.[SubstationID]
      ,SUB.[SubstationName]
	  ,SUB.[SubstationSCADAName]
	  ,SUB.[BuiltBy]
	  /*,LKL.[LimitAmount]
	  ,LKL.[LimitDesc]*/
      ,SUB.[IsActive]
      ,SUB.[created_at]
      ,SUB.[created_by]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB FULL OUTER JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBL ON SUBL.[SubstationID] = SUB.[SubstationID] /*LEFT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] LKL ON LKL.LimitID = SUBL.LimitID*/
      WHERE 1 = 1'
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%'' + @SubstationName + ''%''' ELSE N'' END
      + CASE WHEN @SubstationSCADAName IS NOT NULL AND @SubstationSCADAName <> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%'' + @SubstationSCADAName + ''%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND @BuiltBy <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%'' + @BuiltBy + ''%''' ELSE N'' END
      /*+ CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%'' + @LimitDesc + ''%''' ELSE N'' END*/
	    /*+ COALESCE(CASE WHEN @LimitAmount IS NOT NULL AND @LimitAmount <> 0 THEN N' AND LKL.[LimitAmount] = ' + CAST(@LimitAmount AS nvarchar(255)) END, '')*/

	    + N' GROUP BY SUB.[SubstationID],SUB.[SubstationName],SUB.[SubstationSCADAName],SUB.[BuiltBy],SUB.[IsActive],SUB.[created_at],SUB.[created_by]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' SUB.[created_by]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @SubstationName            nvarchar(255),
      @SubstationSCADAName         nvarchar(255),
      @BuiltBy              nvarchar(255),
	  @LimitAmount			  int,
      @LimitDesc         nvarchar(255),
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @SubstationName,
      @SubstationSCADAName,
      @BuiltBy,
      @LimitAmount,
      @LimitDesc,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewConsIssues =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewConsIssues]
  @ConsultantID			 int			= NULL,
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @ProjectName			 nvarchar(255)  = NULL,
  @CreatedBy	         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;



  DECLARE @sql nvarchar(max) = N'
   SELECT CONI.ConIssueId 
		,CONI.MaalemDubaiRef
		,MPT.ProjectName
		,CONI.Description
		,CONI.created_at
		,CONI.created_by
		,CONI.[IsActive]
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_ConsultantIssues] CONI ON CON.ConsultantID = CONI.ConsultantID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON CONI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE CONI.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255))
	  + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND CONI.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @CreatedBy IS NOT NULL AND @CreatedBy <> '' THEN N' AND CONI.created_by LIKE ''%'' + @CreatedBy + ''%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' CONI.created_at' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantID           int,
	  @MaalemDubaiRef        nvarchar(255),
	  @ProjectName			 nvarchar(255),
	  @CreatedBy	         nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	-- PRINT @sql

	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantID,
	  @MaalemDubaiRef,
	  @ProjectName,
	  @CreatedBy,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_ViewConsProjects =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewConsProjects]
  @ConsultantID			 int			= NULL,
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;



  DECLARE @sql nvarchar(max) = N'
  SELECT MPT.MaalemDubaiRef
		,MPT.ProjectName
		,DEV.DeveloperID
		,DEV.DeveloperName
		,CON.ConsultantID
		,CON.ConsultantName
		,MPT.IsActive
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID
  WHERE 1=1'
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND CON.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' [MPT.ProjectName]' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantID          int,
	  @MaalemDubaiRef        nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantID,
	  @MaalemDubaiRef,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_ViewDevIssues =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevIssues]
  @DeveloperID			 int			= NULL,
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @ProjectName			 nvarchar(255)  = NULL,
  @ALTERdBy	         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;



  DECLARE @sql nvarchar(max) = N'
   SELECT DEVI.DevIssueId
		,DEVI.MaalemDubaiRef
		,MPT.ProjectName
		,DEVI.Description
		,DEVI.created_at
		,DEVI.created_by
		,DEVI.IsActive
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_DeveloperIssues] DEVI ON DEV.DeveloperID = DEVI.DeveloperID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON DEVI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE DEVI.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255))
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND DEVI.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%'' + @ProjectName + ''%''' ELSE N'' END
      + CASE WHEN @ALTERdBy IS NOT NULL AND @ALTERdBy <> '' THEN N' AND DEVI.created_by LIKE ''%'' + @ALTERdBy + ''%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' DEVI.created_at' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperID           int,
	  @MaalemDubaiRef        nvarchar(255),
	  @ProjectName			 nvarchar(255),
	  @ALTERdBy	         nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperID,
	  @MaalemDubaiRef,
	  @ProjectName,
	  @ALTERdBy,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_ViewDevProjects =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevProjects]
  @DeveloperID			 int			= NULL,
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;



  DECLARE @sql nvarchar(max) = N'
   SELECT MPT.MaalemDubaiRef
		,MPT.ProjectName
		,DEV.DeveloperID
		,DEV.DeveloperName
		,MPT.IsActive
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID
  WHERE 1=1'
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' [MPT.ProjectName]' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperID           int,
	  @MaalemDubaiRef        nvarchar(255),
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperID,
	  @MaalemDubaiRef,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_ViewFilesAreaMap =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesAreaMap]
  @FileName				  nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT FAM.[FileID]
      ,FAM.[FileName]
      ,FAM.[DocumentumID]
      ,FAM.[uploaded_by]
      ,FAM.[uploaded_at]
      ,FAM.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaMap] FAM
	WHERE FAM.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FAM.[FileName] LIKE ''%'' + @FileName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FAM.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Day IS NOT NULL AND @Day <> 0 THEN N' AND DAY(FAM.[uploaded_at]) = ' + CAST(@Day AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Month IS NOT NULL AND @Month <> 0 THEN N' AND MONTH(FAM.[uploaded_at]) = ' + CAST(@Month AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Year IS NOT NULL AND @Year <> 0 THEN N' AND YEAR(FAM.[uploaded_at]) = ' + CAST(@Year AS nvarchar(255)) END, '')*/
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FAM.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FAM.[FileID],FAM.[FileName],FAM.[DocumentumID],FAM.[uploaded_by],FAM.[uploaded_at],FAM.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FAM.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DocumentumID              nvarchar(255),
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @MaalemDubaiRef,
	  @DocumentumID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewFilesAreaReport =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesAreaReport]
  @FileName				  nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT FAR.[FileID]
      ,FAR.[FileName]
      ,FAR.[DocumentumID]
      ,FAR.[uploaded_by]
      ,FAR.[uploaded_at]
      ,FAR.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaReport] FAR
	WHERE FAR.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FAR.[FileName] LIKE ''%'' + @FileName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FAR.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Day IS NOT NULL AND @Day <> 0 THEN N' AND DAY(FAR.[uploaded_at]) = ' + CAST(@Day AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Month IS NOT NULL AND @Month <> 0 THEN N' AND MONTH(FAR.[uploaded_at]) = ' + CAST(@Month AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Year IS NOT NULL AND @Year <> 0 THEN N' AND YEAR(FAR.[uploaded_at]) = ' + CAST(@Year AS nvarchar(255)) END, '')*/
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FAR.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FAR.[FileID],FAR.[FileName],FAR.[DocumentumID],FAR.[uploaded_by],FAR.[uploaded_at],FAR.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FAR.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DocumentumID              nvarchar(255),
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @MaalemDubaiRef,
	  @DocumentumID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewFilesPlot =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesPlot]
  @FileName				  nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @ConsultantID			  int = NULL,
  @ConsultantName			  nvarchar(255)  = NULL,
  @Day					  int = NULL,
  @Month				  int = NULL,
  @Year					  int = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPLT.[FileID]
      ,FPLT.[FileName]
      ,FPLT.[DocumentumID]
      ,FPLT.[ConsultantID]
      ,CON.[ConsultantName]
      ,FPLT.[uploaded_at]
      ,FPLT.[uploaded_by]
      ,FPLT.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Plot] FPLT JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID = FPLT.ConsultantID
	WHERE 1=1'
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND FPLT.[MaalemDubaiRef] LIKE ''%'' + @MaalemDubaiRef + ''%''' ELSE N'' END
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPLT.[FileName] LIKE ''%'' + @FileName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPLT.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%'' + @ConsultantName + ''%''' ELSE N'' END
    + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND FPLT.[ConsultantID] = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Day IS NOT NULL AND @Day <> 0 THEN N' AND DAY(FPLT.[uploaded_at]) = ' + CAST(@Day AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Month IS NOT NULL AND @Month <> 0 THEN N' AND MONTH(FPLT.[uploaded_at]) = ' + CAST(@Month AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Year IS NOT NULL AND @Year <> 0 THEN N' AND YEAR(FPLT.[uploaded_at]) = ' + CAST(@Year AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FPLT.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FPLT.[FileID],FPLT.[FileName],FPLT.[DocumentumID],FPLT.[ConsultantID],CON.[ConsultantName],FPLT.[uploaded_at],FPLT.[uploaded_by],FPLT.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FPLT.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DocumentumID              nvarchar(255),
      @ConsultantID			  int,
    @ConsultantName			  nvarchar(255),
	  @Day					  int,
	  @Month				  int,
	  @Year					  int,
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @MaalemDubaiRef,
	  @DocumentumID,
    @ConsultantID,
    @ConsultantName,
	  @Day,
	  @Month,
	  @Year,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewFilesPresentation =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesPresentation]
  @FileName				  nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPRES.[FileID]
      ,FPRES.[FileName]
      ,FPRES.[DocumentumID]
      ,FPRES.[uploaded_by]
      ,FPRES.[uploaded_at]
      ,FPRES.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Presentation] FPRES
	WHERE FPRES.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPRES.[FileName] LIKE ''%'' + @FileName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPRES.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FPRES.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FPRES.[FileID],FPRES.[FileName],FPRES.[DocumentumID],FPRES.[uploaded_by],FPRES.[uploaded_at],FPRES.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FPRES.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DocumentumID              nvarchar(255),
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @MaalemDubaiRef,
	  @DocumentumID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewFilesProjectLayout =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesProjectLayout]
  @FileName				  nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPL.[FileID]
      ,FPL.[FileName]
      ,FPL.[DocumentumID]
      ,FPL.[uploaded_by]
      ,FPL.[uploaded_at]
      ,FPL.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ProjectLayout] FPL
	WHERE FPL.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPL.[FileName] LIKE ''%'' + @FileName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPL.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Day IS NOT NULL AND @Day <> 0 THEN N' AND DAY(FPL.[uploaded_at]) = ' + CAST(@Day AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Month IS NOT NULL AND @Month <> 0 THEN N' AND MONTH(FPL.[uploaded_at]) = ' + CAST(@Month AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Year IS NOT NULL AND @Year <> 0 THEN N' AND YEAR(FPL.[uploaded_at]) = ' + CAST(@Year AS nvarchar(255)) END, '')*/
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FPL.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FPL.[FileID],FPL.[FileName],FPL.[DocumentumID],FPL.[uploaded_by],FPL.[uploaded_at],FPL.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FPL.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DocumentumID              nvarchar(255),
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @MaalemDubaiRef,
	  @DocumentumID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewFilesZoning =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesZoning]
  @FileName				  nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT FZ.[FileID]
      ,FZ.[FileName]
      ,FZ.[DocumentumID]
      ,FZ.[uploaded_by]
      ,FZ.[uploaded_at]
      ,FZ.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Zoning] FZ
	WHERE FZ.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FZ.[FileName] LIKE ''%'' + @FileName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FZ.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Day IS NOT NULL AND @Day <> 0 THEN N' AND DAY(FZ.[uploaded_at]) = ' + CAST(@Day AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Month IS NOT NULL AND @Month <> 0 THEN N' AND MONTH(FZ.[uploaded_at]) = ' + CAST(@Month AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @Year IS NOT NULL AND @Year <> 0 THEN N' AND YEAR(FZ.[uploaded_at]) = ' + CAST(@Year AS nvarchar(255)) END, '')*/
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FZ.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FZ.[FileID],FZ.[FileName],FZ.[DocumentumID],FZ.[uploaded_by],FZ.[uploaded_at],FZ.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FZ.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @MaalemDubaiRef         nvarchar(255),
      @DocumentumID              nvarchar(255),
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @MaalemDubaiRef,
	  @DocumentumID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewProjDetails =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjDetails]
  @MaalemDubaiRef        nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
   SELECT MPT.[Ref]
      ,MPT.[MaalemDubaiRef]
      ,MPT.[ProjectName]
      ,MPT.[Engineer]
      ,MPT.[AsstEng]
      ,MPT.[MasterPlanStatus]
      ,MPT.[Corridors11kV]
      ,MPT.[Ducts11kV]
      ,MPT.[HVNOC]
      ,MPT.[SiteSurveyor]
      ,MPT.[AreaMap]
      ,MPT.[AreaMapRef]
      ,MPT.[AreaReport]
      ,MPT.[DeveloperID]
      ,MPT.[SS400kV]
      ,MPT.[SS132kV]
      ,MPT.[Zone]
      ,MPT.[SubZone]
      ,MPT.[BuiltPerc]
      ,MPT.[UCPerc]
      ,MPT.[VPerc]
      ,MPT.[SS132kVExisting]
      ,MPT.[ProjectCategory]
      ,MPT.[created_at]
      ,MPT.[created_by]
      ,MPT.[updated_at]
      ,MPT.[updated_by]
      ,MPT.[IsActive]
      ,MPT.[MaalemDubaiNo]
      ,DEV.[DeveloperName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON DEV.DeveloperID = MPT.DeveloperID
  WHERE MPT.[MaalemDubaiRef] = @MaalemDubaiRef'
 
    DECLARE @params nvarchar(max) = N'
	  @MaalemDubaiRef        nvarchar(255)';
 
	-- PRINT @sql

	EXEC sys.sp_executesql @sql, @params,
	  @MaalemDubaiRef

END
GO

-- ===== sp_UC000420_ViewProjExistingKVSS =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjExistingKVSS]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;



  DECLARE @sql nvarchar(max) = N'
  SELECT KVSS.RowId
		,SUB.SubstationName
		,KVSS.[Status]
		,KVSS.[created_at]
		,KVSS.[created_by]
		,KVSS.[updated_at]
		,KVSS.[updated_by]
		,KVSS.[IsActive]
		,SUB.SubstationID
		,SUB.[SubstationSCADAName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ExistingKVSS] KVSS JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON KVSS.SubstationID = SUB.SubstationID
  WHERE KVSS.[MaalemDubaiRef] = @MaalemDubaiRef'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' KVSS.[created_at]' END
      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
	  @MaalemDubaiRef        nvarchar(255),
	  @OrderByColumn         nvarchar(255),
	  @SortType              nvarchar(255),
	  @PageSize              int,
	  @PageNumber            int'
 
	-- PRINT @sql

	EXEC sys.sp_executesql @sql, @params,
	  @MaalemDubaiRef,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_ViewProjFutureYears =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjFutureYears]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;



  DECLARE @sql nvarchar(max) = N'
  SELECT PFY.[RowId]
	  ,PFY.[ProjectYear]
      ,PFY.[Remark]
      ,SUB.[SubstationName]
      ,PFY.[Status]
      ,PFY.[created_at]
      ,PFY.[created_by]
      ,PFY.[updated_at]
      ,PFY.[updated_by]
	  ,PFY.[IsActive]
	  ,SUB.SubstationID
	  ,SUB.[SubstationSCADAName]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsFutureYears] PFY JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON PFY.SubstationID = SUB.SubstationID
  WHERE PFY.[MaalemDubaiRef] = @MaalemDubaiRef'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PFY.[created_at]' END
      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
	  @MaalemDubaiRef        nvarchar(255),
	  @OrderByColumn         nvarchar(255),
	  @SortType              nvarchar(255),
	  @PageSize              int,
	  @PageNumber            int';
 
	-- PRINT @sql

	EXEC sys.sp_executesql @sql, @params,
	  @MaalemDubaiRef,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END
GO

-- ===== sp_UC000420_ViewProjHistory =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjHistory]
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @HistoryDate			 nvarchar(255)  = NULL,
  @PTPLetterReceived    nvarchar(255)  = NULL,
  @MPLetterRef		     nvarchar(255)  = NULL,
  @PTPReplytoParty		 nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT PH.[RowID]
      ,PH.[HistoryDate]
	  ,PH.[PTPLetterReceived]
	  ,PH.[MPLetterRef]
      ,PHFL.[FileID]
	  ,FPTP.[DocumentumID]
      ,PH.[created_by]
      ,PH.[created_at]
      ,FPTP.[uploaded_by]
      ,FPTP.[uploaded_at]
      ,PHFL.[IsActive]
	  ,FPTP.[FileName] AS ''PTPReplyToParty''
	  ,FPTP.[DocuFileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistory] PH FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistoryFileLink] PHFL ON PHFL.ProjectHistId = PH.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PTPReply] FPTP ON FPTP.[FileID] = PHFL.[FileID]
	WHERE /*PHFL.[IsActive] = 1 AND*/ PH.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @HistoryDate IS NOT NULL AND @HistoryDate <> '' THEN N' AND PH.[HistoryDate] LIKE ''%'' + @HistoryDate + ''%''' ELSE N'' END
	  + CASE WHEN @PTPLetterReceived IS NOT NULL AND @PTPLetterReceived <> '' THEN N' AND PH.[PTPLetterReceived] LIKE ''%'' + @PTPLetterReceived + ''%''' ELSE N'' END
	  + CASE WHEN @MPLetterRef IS NOT NULL AND @MPLetterRef <> '' THEN N' AND PH.[MPLetterRef] LIKE ''%'' + @MPLetterRef + ''%''' ELSE N'' END
	  + CASE WHEN @PTPReplytoParty IS NOT NULL AND @PTPReplytoParty <> '' THEN N' AND FPTP.[FileName] LIKE ''%'' + @PTPReplytoParty + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPTP.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND PH.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY PH.[RowID],PH.[HistoryDate],PH.[PTPLetterReceived],PH.[MPLetterRef],PHFL.[FileID],FPTP.[DocumentumID],PH.[created_by],PH.[created_at],FPTP.[uploaded_by],FPTP.[uploaded_at],PHFL.[IsActive],FPTP.[FileName],FPTP.[DocuFileName]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PH.[created_at]' END
      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @MaalemDubaiRef         nvarchar(255),
	  @HistoryDate			 nvarchar(255),
	  @PTPLetterReceived    nvarchar(255),
	  @MPLetterRef		     nvarchar(255),
	  @PTPReplytoParty		 nvarchar(255),
      @DocumentumID              nvarchar(255),
      @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @MaalemDubaiRef,
	  @HistoryDate,
	  @PTPLetterReceived,
	  @MPLetterRef,
	  @PTPReplytoParty,
	  @DocumentumID,
      @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewProjIssues =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjIssues]
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @Description	  nvarchar(2000)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT ISS.[RowID]
      ,ISS.[Description]
      ,ISSFL.[FileID]
	  ,FISS.[DocumentumID]
      ,ISS.[created_by]
      ,ISS.[created_at]
      ,FISS.[uploaded_by]
      ,FISS.[uploaded_at]
      ,ISS.[IsActive]
	  ,FISS.[FileName]
	  ,FISS.[DocuFileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Issues] ISS FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_IssuesFileLink] ISSFL ON ISSFL.IssueId = ISS.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Issues] FISS ON FISS.[FileID] = ISSFL.[FileID]
	WHERE ISSFL.[IsActive] = 1 AND ISS.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @Description IS NOT NULL AND @Description <> '' THEN N' AND ISS.[Description] LIKE ''%'' + @Description + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FISS.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND ISS.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY ISS.[RowID],ISS.[Description],ISSFL.[FileID],FISS.[DocumentumID],ISS.[created_by],ISS.[created_at],FISS.[uploaded_by],FISS.[uploaded_at],ISS.[IsActive],FISS.[FileName],FISS.[DocuFileName]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' ISS.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @MaalemDubaiRef         nvarchar(255),
      @Description	  nvarchar(2000),
      @DocumentumID              nvarchar(255),
      @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @MaalemDubaiRef,
      @Description,
	  @DocumentumID,
      @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewProjPPR =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjPPR]
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @SubstationName	  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;

 
  DECLARE @sql nvarchar(max) = N'
    SELECT PPR.[RowID]
      ,PPR.[SubstationID]
      ,PPRFL.[FileID]
	  ,FPPR.[DocumentumID]
	  ,SUB.SubstationName
      ,PPR.[created_by]
      ,PPR.[created_at]
      ,FPPR.[uploaded_by]
      ,FPPR.[uploaded_at]
      ,PPRFL.[IsActive]
	  ,FPPR.[FileName]
	  ,FPPR.[DocuFileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPR] PPR FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPRFileLink] PPRFL ON PPRFL.PPRId = PPR.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PPR] FPPR ON FPPR.[FileID] = PPRFL.[FileID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PPR.SubstationID
	WHERE /*PPRFL.[IsActive] = 1 AND*/ PPR.[MaalemDubaiRef] = @MaalemDubaiRef'
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%'' + @SubstationName + ''%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPPR.DocumentumID LIKE ''%'' + @DocumentumID + ''%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND PPR.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY PPR.[RowID],PPR.[SubstationID],PPRFL.[FileID],FPPR.[DocumentumID],SUB.SubstationName,PPR.[created_by],PPR.[created_at],FPPR.[uploaded_by],FPPR.[uploaded_at],PPRFL.[IsActive],FPPR.[FileName],FPPR.[DocuFileName]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PPR.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @MaalemDubaiRef         nvarchar(255),
      @SubstationName	  nvarchar(255),
      @DocumentumID              nvarchar(255),
	    @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @MaalemDubaiRef,
      @SubstationName,
	  @DocumentumID,
      @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END
GO

-- ===== sp_UC000420_ViewProjRemarks =====
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjRemarks]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)  = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- guard (also checked by sp_UC000420_Api): sort column and direction are pasted into the query text
  IF @OrderByColumn IS NOT NULL AND @OrderByColumn LIKE N'%[^A-Za-z0-9_.]%' THROW 50004, 'OrderByColumn contains invalid characters', 1;
  IF @SortType IS NOT NULL AND UPPER(@SortType) NOT IN (N'ASC', N'DESC') THROW 50005, 'SortType must be ASC or DESC', 1;


  DECLARE @sql nvarchar(max) = N'
  SELECT PR.[RowId]
      ,PR.[MaalemDubaiRef]
      ,PR.[Remarks]
      ,PR.[created_at]
      ,PR.[created_by]
      ,PR.[updated_at]
      ,PR.[updated_by]
      ,PR.[IsActive]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsRemarks] PR
  WHERE PR.[MaalemDubaiRef] = @MaalemDubaiRef'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PR.[created_at]' END
      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';

  DECLARE @params nvarchar(max) = N'
    @MaalemDubaiRef        nvarchar(255),
    @OrderByColumn         nvarchar(255),
    @SortType              nvarchar(255),
    @PageSize              int,
    @PageNumber            int';

  EXEC sys.sp_executesql @sql, @params,
    @MaalemDubaiRef,
    @OrderByColumn,
    @SortType,
    @PageSize,
    @PageNumber
END
GO
