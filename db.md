SQL - Procedures
SQL - 1
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_DeletePlots_AllPages]    Script Date: 10/14/2026 1:41:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchPlots];
ALTER PROCEDURE [dbo].[sp_UC000420_DeletePlots_AllPages]
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
	WITH cte AS (
	SELECT PLT.[RowID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID = PLT.ConsultantID
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
	WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')
	  + N' GROUP BY PLT.[RowID],PLT.[DevPlotNum],PLT.[DMPlotNum],PLT.[LandUse],MPT.[ProjectName],MPT.[MaalemDubaiRef],DEV.[DeveloperID],DEV.[DeveloperName],CON.[ConsultantID],CON.[ConsultantName],PLT.[IsActive],PLT.[created_at],PLT.[created_by]'
      + ') DELETE FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots]
		WHERE RowID IN (
			SELECT RowID
			FROM cte
		);'
 

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

SQL - 2
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_DeletePlots_Page]    Script Date: 10/14/2026 1:44:40 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_DeletePlots_Page]
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
 
  DECLARE @sql nvarchar(max) = N'
	WITH cte AS (
	SELECT PLT.[RowID], ROW_NUMBER() OVER (ORDER BY'
	+ CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PLT.[created_at]' END
	+ CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' DESC' END + ') AS RowNum
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID = PLT.ConsultantID
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID
	JOIN [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
	WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')
	  + N' GROUP BY PLT.[RowID],PLT.[DevPlotNum],PLT.[DMPlotNum],PLT.[LandUse],MPT.[ProjectName],MPT.[MaalemDubaiRef],DEV.[DeveloperID],DEV.[DeveloperName],CON.[ConsultantID],CON.[ConsultantName],PLT.[IsActive],PLT.[created_at],PLT.[created_by]'
      + ') DELETE FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots]
		WHERE RowID IN (
			SELECT RowID
			FROM cte
			ORDER BY RowNum
			OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY);'

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

SQL - 3
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_DisableEnablePlots_AllPages]    Script Date: 10/14/2026 1:44:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_DisableEnablePlots_AllPages]
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
  @Status				  int  = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    UPDATE [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots]
	SET IsActive = ' + CAST(@Status AS nvarchar(255)) + '
	WHERE RowID IN (SELECT PLT.[RowID]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' GROUP BY PLT.[RowID]);';
 

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
	  @Status				int';
 
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
	  @Status

END

SQL - 4
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_DisableEnablePlots_Page]    Script Date: 10/14/2026 1:45:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_DisableEnablePlots_Page]
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
  @Status				  int  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    UPDATE [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots]
	SET IsActive = ' + CAST(@Status AS nvarchar(255)) + '
	WHERE RowID IN (SELECT PLT.[RowID]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE 1 = 1'
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	  + N' GROUP BY PLT.[RowID]'
	  + CASE WHEN @OrderByColumn IS NOT NULL THEN N', ' + @OrderByColumn ELSE N', PLT.[created_at]' END
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PLT.[created_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' DESC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY) OPTION (RECOMPILE);';
 
	/*PRINT @sql*/

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
	  @Status				  int,
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
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END

SQL - 5
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchConsultants]    Script Date: 10/14/2026 1:45:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants]
  @ConsultantName        nvarchar(255)		= NULL,
  @OrderByColumn         nvarchar(255)		= NULL,
  @SortType              nvarchar(255)		= NULL,
  @PageSize              int				= NULL,
  @PageNumber            int				= NULL
AS
BEGIN
  SET NOCOUNT ON;
 
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
        N' AND ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 6
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchConsultants_Count]    Script Date: 10/14/2026 1:46:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants_Count]
  @ConsultantName        nvarchar(255)		= NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(*) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] WHERE 1 = 1'
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN
        N' AND ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
      + N';';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantName        nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantName

END

SQL - 7
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchConsultants_SO]    Script Date: 10/14/2026 1:46:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants_SO]
  @ConsultantName        nvarchar(255)		= NULL,
  @OrderByColumn         nvarchar(255)		= NULL,
  @SortType              nvarchar(255)		= NULL,
  @PageSize              int				= NULL,
  @PageNumber            int				= NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT [ConsultantID]
      ,[ConsultantName]
      ,[ConsultantURL]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] WHERE [IsActive] = 1'
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN
        N' AND ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 8

USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchConsultants_SO_Test]    Script Date: 10/14/2026 1:46:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchConsultants_SO_Test]
  @ConsultantName        nvarchar(255)		= NULL,
  @OrderByColumn         nvarchar(255)		= NULL,
  @SortType              nvarchar(255)		= NULL,
  @PageSize              int				= NULL,
  @PageNumber            int				= NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT [ConsultantID]
      ,[ConsultantName]
      ,[ConsultantURL]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] WHERE [IsActive] = 1'
      + CASE WHEN trim(@ConsultantName) IS NOT NULL AND trim(@ConsultantName) <> '' THEN
        N' AND ConsultantName LIKE ''%' + trim(@ConsultantName) + '%''' ELSE N'' END
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

SQL - 9
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchDevelopers]    Script Date: 10/14/2026 1:46:47 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers]
  @DeveloperName         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
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
        N' AND DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
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

SQL - 10
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchDevelopers_Count]    Script Date: 10/14/2026 1:47:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers_Count]
  @DeveloperName         nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT COUNT(*) AS TotalCount
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] WHERE 1 = 1'
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN
        N' AND DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
      + N' ;';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperName         nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperName

END

SQL - 11
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchDevelopers_SO]    Script Date: 10/14/2026 1:47:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers_SO]
  @DeveloperName         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT [DeveloperID]
      ,[DeveloperName]
      ,[DeveloperURL]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers]
	  WHERE [IsActive] = 1'
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN
        N' AND DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
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

SQL - 12
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchDevelopers_SO_Test]    Script Date: 10/14/2026 1:47:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchDevelopers_SO_Test]
  @DeveloperName         nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT [DeveloperID]
      ,[DeveloperName]
      ,[DeveloperURL]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers]
	  WHERE [IsActive] = 1'
      + CASE WHEN trim(@DeveloperName) IS NOT NULL AND trim(@DeveloperName) <> '' THEN
        N' AND DeveloperName LIKE ''%' + trim(@DeveloperName) + '%''' ELSE N'' END
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

SQL - 13
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchPlots]    Script Date: 10/14/2026 1:47:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 14
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchPlots_Count]    Script Date: 10/14/2026 1:47:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots_Count]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 15
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchPlots_SO]    Script Date: 10/14/2026 1:47:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots_SO]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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
SQL - 16
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchPlots_SO_Test]    Script Date: 10/14/2026 1:48:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchPlots_SO_Test]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN trim(@DevPlotNum) IS NOT NULL AND trim(@DevPlotNum) <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + trim(@DevPlotNum) + '%''' ELSE N'' END
      + CASE WHEN trim(@DMPlotNum) IS NOT NULL AND trim(@DMPlotNum) <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + trim(@DMPlotNum) + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 17
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchProjects]    Script Date: 10/14/2026 1:48:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 18
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchProjects_Count]    Script Date: 10/14/2026 1:48:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects_Count]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 19
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchProjects_SO]    Script Date: 10/14/2026 1:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects_SO]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 20
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchProjects_SO_Test]    Script Date: 10/14/2026 1:48:52 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects_SO_Test]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT MPT.[ProjectName]
      ,MPT.[MaalemDubaiRef]
      ,DEV.[DeveloperName]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT LEFT JOIN 
		    [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID  = PLT.ConsultantID LEFT JOIN
	    	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID LEFT JOIN
			[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PLT.InitSubID OR SUB.SubstationID = PLT.UltSubID
      WHERE MPT.[IsActive] = 0'
      + CASE WHEN trim(@ProjectName) IS NOT NULL AND trim(@ProjectName) <> '' THEN N' AND MPT.ProjectName LIKE ''%' + trim(@ProjectName) + '%''' ELSE N'' END
      + CASE WHEN trim(@MaalemDubaiRef) IS NOT NULL AND trim(@MaalemDubaiRef) <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + trim(@MaalemDubaiRef) + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationSCADAName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 21
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchProjects_Test]    Script Date: 10/14/2026 1:49:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchProjects_Test]
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
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @DevPlotNum IS NOT NULL AND @DevPlotNum <> '' THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL AND @DMPlotNum <> '' THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubFullName IS NOT NULL AND @InitDEWASubFullName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubFullName + '%''' ELSE N'' END
      + CASE WHEN @InitDEWASubSCADAName IS NOT NULL AND @InitDEWASubSCADAName <> '' THEN N' AND SUB.SubstationName LIKE ''%' + @InitDEWASubSCADAName + '%''' ELSE N'' END
      + CASE WHEN @DeveloperName IS NOT NULL AND @DeveloperName <> '' THEN N' AND DEV.DeveloperName LIKE ''%' + @DeveloperName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0 THEN N' AND MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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


	  SELECT TOP (1000) [RowId]
      ,[MaalemDubaiRef]
      ,[ProjectYear]
      ,[Remark]
      ,[SubstationID]
      ,[Status]
      ,[created_at]
      ,[created_by]
      ,[updated_at]
      ,[updated_by]
      ,[ObjectKey]
      ,[RobotName]
      ,[ExecutionId]
      ,[FirstExtracted]
      ,[LastExtracted]
      ,[ExtractedInLastRun]
      ,[LastUpdated]
      ,[IsActive]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsFutureYears]
    WHERE MaalemDubaiRef = 'MP-00020-084'
END

SQL - 22
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchSubstations]    Script Date: 10/14/2026 1:49:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations]
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
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%' + @SubstationName + '%''' ELSE N'' END
      + CASE WHEN @SubstationSCADAName IS NOT NULL AND @SubstationSCADAName <> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%' + @SubstationSCADAName + '%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND @BuiltBy <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%' + @BuiltBy + '%''' ELSE N'' END
      /*+ CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%' + @LimitDesc + '%''' ELSE N'' END*/
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

SQL - 23
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchSubstations_Count]    Script Date: 10/14/2026 1:49:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations_Count]
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
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%' + @SubstationName + '%''' ELSE N'' END
      + CASE WHEN @SubstationSCADAName IS NOT NULL AND @SubstationSCADAName <> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%' + @SubstationSCADAName + '%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND @BuiltBy <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%' + @BuiltBy + '%''' ELSE N'' END
      + CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%' + @LimitDesc + '%''' ELSE N'' END

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

SQL - 24
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchSubstations_SO]    Script Date: 10/14/2026 1:49:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations_SO]
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
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%' + @SubstationName + '%''' ELSE N'' END
      + CASE WHEN @SubstationSCADAName IS NOT NULL AND @SubstationSCADAName <> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%' + @SubstationSCADAName + '%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND @BuiltBy <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%' + @BuiltBy + '%''' ELSE N'' END
      /*+ CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%' + @LimitDesc + '%''' ELSE N'' END*/
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

SQL - 25
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_SearchSubstations_SO_Test]    Script Date: 10/14/2026 1:49:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_SearchSubstations_SO_Test]
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
      WHERE SUB.[IsActive] = 0'
      + CASE WHEN trim(@SubstationName) IS NOT NULL AND trim(@SubstationName) <> '' THEN N' AND SUB.[SubstationName] LIKE ''%' + trim(@SubstationName) + '%''' ELSE N'' END
      + CASE WHEN trim(@SubstationSCADAName) IS NOT NULL AND trim(@SubstationSCADAName)<> '' THEN N' AND SUB.[SubstationSCADAName] LIKE ''%' + trim(@SubstationSCADAName) + '%''' ELSE N'' END
      + CASE WHEN @BuiltBy IS NOT NULL AND trim(@BuiltBy) <> '' THEN N' AND SUB.[BuiltBy] LIKE ''%' + trim(@BuiltBy) + '%''' ELSE N'' END
      /*+ CASE WHEN @LimitDesc IS NOT NULL AND @LimitDesc <> '' THEN N' AND LKL.[LimitDesc] LIKE ''%' + @LimitDesc + '%''' ELSE N'' END*/
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

SQL - 26
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewConAndDevStats]    Script Date: 10/14/2026 1:50:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewConAndDevStats]
  @ConsultantID			 int			= NULL,
  @DeveloperID			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

  DECLARE @sql nvarchar(max) = N'
    SELECT @TotalTCL = SUM(TCL)/1000
      ,@TotalDCP = SUM(DCP)/1000
	  ,@TotalPlots = SUM(PLOTS)
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1'
	  + COALESCE(CASE WHEN @DeveloperID IS NOT NULL AND @DeveloperID <> 0  THEN N' AND DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @ConsultantID IS NOT NULL AND @ConsultantID <> 0 THEN N' AND ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255)) END, '')

	DECLARE @params nvarchar(max) = N'
	@ConsultantID         int,
	@DeveloperID         int,
	@TotalTCL	float OUT,
	@TotalDCP	float OUT,
	@TotalPlots	float OUT';

	EXEC sys.sp_executesql @sql, @params, 
		@ConsultantID,
		@DeveloperID,
		@TotalTCL OUT,
		@TotalDCP OUT,
		@TotalPlots OUT

  /*SELECT @TotalPlots = COUNT(PLT.RowID) 
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef
  WHERE PLT.ConsultantID = @ConsultantID;*/

  SELECT @TotalPlots AS 'TotalPlots'
		,@TotalTCL AS 'TotalTCL'
		,@TotalDCP AS 'TotalDCP'

END

SQL - 27
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewConDetails_SO]    Script Date: 10/14/2026 1:50:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewConDetails_SO]
  @ConsultantID			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1 CON.[ConsultantName]
		,CON.[ConsultantURL]
		,CONI.[DocumentumID]
		,CONI.[FileName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ConImages] CONI ON CON.ConsultantID = CON.ConsultantID
  WHERE CON.IsActive = 1 /*AND CONI.IsActive = 1*/ AND CON.ConsultantID = @ConsultantID
  ORDER BY CONI.uploaded_at DESC

  SELECT CONI.MaalemDubaiRef
		,MPT.ProjectName
		,CONI.Description
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_ConsultantIssues] CONI ON CON.ConsultantID = CONI.ConsultantID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON CONI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE CONI.IsActive = 1 AND CONI.ConsultantID = @ConsultantID

  SELECT MPT.MaalemDubaiRef
		,MPT.ProjectName
		,DEV.DeveloperName
		,CAST(ROUND(TPS.TCL/1000, 0) AS INT) AS TCL
		,TPS.PLOTS
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] TPS ON TPS.MaalemDubaiRef = PLT.MaalemDubaiRef
  WHERE MPT.IsActive = 1 AND DEV.IsActive = 1 AND CON.ConsultantID = @ConsultantID AND TPS.ConsultantID = @ConsultantID
  GROUP BY MPT.MaalemDubaiRef,MPT.ProjectName,DEV.DeveloperName,TPS.TCL,TPS.PLOTS

  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

	SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT) 
		,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
		,@TotalPlots = SUM(PLOTS)
		FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1 AND ConsultantID = @ConsultantID

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

END

SQL - 28
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewConDetails_SO_Test]    Script Date: 10/14/2026 1:50:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewConDetails_SO_Test]
  @ConsultantID			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1 CON.[ConsultantName]
		,CON.[ConsultantURL]
		,CONI.[DocumentumID]
		,CONI.[FileName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ConImages] CONI ON CON.ConsultantID = CON.ConsultantID
  WHERE CON.IsActive = 1 /*AND CONI.IsActive = 1*/ AND CON.ConsultantID = @ConsultantID
  ORDER BY CONI.uploaded_at DESC

  SELECT CONI.MaalemDubaiRef
		,MPT.ProjectName
		,CONI.Description
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_ConsultantIssues] CONI ON CON.ConsultantID = CONI.ConsultantID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON CONI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE CONI.IsActive = 1 AND CONI.ConsultantID = @ConsultantID

  --SELECT MPT.MaalemDubaiRef
		--,MPT.ProjectName
		--,DEV.DeveloperName
		--,CAST(ROUND(TPS.TCL/1000, 0) AS INT) AS TCL
		--,TPS.PLOTS
  --FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] TPS ON TPS.MaalemDubaiRef = PLT.MaalemDubaiRef
  --WHERE MPT.IsActive = 1 AND DEV.IsActive = 1 AND CON.ConsultantID = @ConsultantID AND TPS.ConsultantID = @ConsultantID
  --GROUP BY MPT.MaalemDubaiRef,MPT.ProjectName,DEV.DeveloperName,TPS.TCL,TPS.PLOTS

  SELECT 
		
		DEV.DeveloperName
		
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID 
	
  WHERE MPT.IsActive = 1 AND DEV.IsActive = 1 AND CON.ConsultantID = @ConsultantID 
  GROUP BY DEV.DeveloperName




  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

	SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT) 
		,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
		,@TotalPlots = SUM(PLOTS)
		FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1 AND ConsultantID = @ConsultantID

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

END

SQL - 29
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewConDevelopers]    Script Date: 10/14/2026 1:50:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewConDevelopers]
  @ConsultantID			 int			= NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT DEV.DeveloperName
		--,MPT.ProjectName
		,DEV.IsActive
		,DEV.created_at
		,DEV.created_by
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID
  WHERE PLT.ConsultantID = ' + CAST(@ConsultantID AS nvarchar(255))
      --+ N' GROUP BY DEV.DeveloperName, MPT.ProjectName, DEV.IsActive, MPT.created_at, MPT.created_by'
	  + N' GROUP BY DEV.DeveloperName, DEV.IsActive, DEV.created_at, DEV.created_by'
	  + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' DEV.created_by' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @ConsultantID           int,
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @ConsultantID,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END

SQL - 30
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewConsIssues]    Script Date: 10/14/2026 1:51:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewConsIssues]
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
	  + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND CONI.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @CreatedBy IS NOT NULL AND @CreatedBy <> '' THEN N' AND CONI.created_by LIKE ''%' + @CreatedBy + '%''' ELSE N'' END
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

SQL - 31
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewConsProjects]    Script Date: 10/14/2026 1:51:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewConsProjects]
  @ConsultantID			 int			= NULL,
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


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
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
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

SQL - 32
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewDevConsultants]    Script Date: 10/14/2026 1:51:37 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevConsultants]
  @DeveloperID			 int			= NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT CON.ConsultantName
		--,MPT.ProjectName
		,CON.IsActive
		,CON.created_at
		,CON.created_by
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID
  WHERE MPT.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255))
      --+ N' GROUP BY CON.ConsultantName, MPT.ProjectName, CON.IsActive, MPT.created_at, MPT.created_by'
	  + N' GROUP BY CON.ConsultantName, CON.IsActive, CON.created_at, CON.created_by'
	  + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' CON.created_by' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @DeveloperID           int,
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DeveloperID,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END

SQL - 33
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewDevDetails_SO]    Script Date: 10/14/2026 1:51:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevDetails_SO]
  @DeveloperID			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1 DEV.[DeveloperName]
		,DEV.[DeveloperURL]
		,DEVI.[DocumentumID]
		,DEVI.[FileName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_DevImages] DEVI ON DEVI.FileID = DEV.FileId
  WHERE DEV.IsActive = 1 AND DEV.DeveloperID = @DeveloperID
  ORDER BY DEVI.uploaded_at DESC

  SELECT DEVI.MaalemDubaiRef
		,MPT.ProjectName
		,DEVI.Description
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_DeveloperIssues] DEVI ON DEV.DeveloperID = DEVI.DeveloperID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON DEVI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE DEVI.IsActive = 1 AND DEVI.DeveloperID = @DeveloperID

  SELECT MPT.ProjectName
		,MPT.MaalemDubaiRef
		,CON.ConsultantName
		,CON.ConsultantURL
		,CONI.DocumentumID
		,CONI.FileName
		,CAST(ROUND(TPS.TCL/1000, 0) AS INT) AS TCL
		,TPS.PLOTS
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ConImages] CONI ON CONI.FileId = CON.FileId JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] TPS ON TPS.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE MPT.IsActive = 1 AND CON.IsActive = 1 AND MPT.DeveloperID = @DeveloperID AND TPS.DeveloperID = @DeveloperID
  GROUP BY MPT.ProjectName,MPT.MaalemDubaiRef,CON.ConsultantName,CON.ConsultantURL,CONI.DocumentumID,CONI.FileName,TPS.TCL,TPS.PLOTS

  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

	SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT) 
		,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
		,@TotalPlots = SUM(PLOTS)
		FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1 AND DeveloperID = @DeveloperID

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

END

SQL - 34
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewDevDetails_SO_Test]    Script Date: 10/14/2026 1:52:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevDetails_SO_Test]
  @DeveloperID			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1 DEV.[DeveloperName]
		,DEV.[DeveloperURL]
		,DEVI.[DocumentumID]
		,DEVI.[FileName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_DevImages] DEVI ON DEVI.FileID = DEV.FileId
  WHERE DEV.IsActive = 1 AND DEV.DeveloperID = @DeveloperID
  ORDER BY DEVI.uploaded_at DESC

  SELECT DEVI.MaalemDubaiRef
		,MPT.ProjectName
		,DEVI.Description
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_DeveloperIssues] DEVI ON DEV.DeveloperID = DEVI.DeveloperID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON DEVI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE DEVI.IsActive = 1 AND DEVI.DeveloperID = @DeveloperID

  --SELECT MPT.ProjectName
		--,MPT.MaalemDubaiRef
		--,CON.ConsultantName
		--,CON.ConsultantURL
		--,CONI.DocumentumID
		--,CONI.FileName
		--,CAST(ROUND(TPS.TCL/1000, 0) AS INT) AS TCL
		--,TPS.PLOTS
  --FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID LEFT JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ConImages] CONI ON CONI.FileId = CON.FileId JOIN
	 --  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] TPS ON TPS.MaalemDubaiRef = MPT.MaalemDubaiRef
  --WHERE MPT.IsActive = 1 AND CON.IsActive = 1 AND MPT.DeveloperID = @DeveloperID AND TPS.DeveloperID = @DeveloperID
  --GROUP BY MPT.ProjectName,MPT.MaalemDubaiRef,CON.ConsultantName,CON.ConsultantURL,CONI.DocumentumID,CONI.FileName,TPS.TCL,TPS.PLOTS


  SELECT 
		CON.ConsultantName
		,CON.ConsultantURL
		,CONI.DocumentumID
		,CONI.FileName

		
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ConImages] CONI ON CONI.FileId = CON.FileId 
	 
  WHERE MPT.IsActive = 1 AND CON.IsActive = 1 AND MPT.DeveloperID = @DeveloperID 
  GROUP BY CON.ConsultantName,CON.ConsultantURL,CONI.DocumentumID,CONI.FileName
  
  
  
  
  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

	SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT) 
		,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
		,@TotalPlots = SUM(PLOTS)
		FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1 AND DeveloperID = @DeveloperID

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

END

SQL - 35
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewDevIssues]    Script Date: 10/14/2026 1:52:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevIssues]
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


  DECLARE @sql nvarchar(max) = N'
   SELECT DEVI.DevIssueId
		,DEVI.MaalemDubaiRef
		,MPT.ProjectName
		,DEVI.Description
		,DEVI.ALTERd_at
		,DEVI.ALTERd_by
		,DEVI.IsActive
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_DeveloperIssues] DEVI ON DEV.DeveloperID = DEVI.DeveloperID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON DEVI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE DEVI.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255))
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND DEVI.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @ALTERdBy IS NOT NULL AND @ALTERdBy <> '' THEN N' AND DEVI.ALTERd_by LIKE ''%' + @ALTERdBy + '%''' ELSE N'' END
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' DEVI.ALTERd_at' END
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

SQL - 36
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewDevProjects]    Script Date: 10/14/2026 1:52:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- DROP PROCEDURE [sp_UC000420_ViewDeveloperProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewDevProjects]
  @DeveloperID			 int			= NULL,
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
   SELECT MPT.MaalemDubaiRef
		,MPT.ProjectName
		,DEV.DeveloperID
		,DEV.DeveloperName
		,MPT.IsActive
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID
  WHERE 1=1'
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND MPT.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
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

SQL - 37
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesAreaMap]    Script Date: 10/14/2026 1:52:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesAreaMap]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FAM.[FileID]
      ,FAM.[FileName]
      ,FAM.[DocumentumID]
      ,FAM.[uploaded_by]
      ,FAM.[uploaded_at]
      ,FAM.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaMap] FAM
	WHERE FAM.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FAM.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FAM.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

SQL - 38
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesAreaReport]    Script Date: 10/14/2026 1:52:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesAreaReport]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FAR.[FileID]
      ,FAR.[FileName]
      ,FAR.[DocumentumID]
      ,FAR.[uploaded_by]
      ,FAR.[uploaded_at]
      ,FAR.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaReport] FAR
	WHERE FAR.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FAR.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FAR.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

SQL - 39
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesIssues]    Script Date: 10/14/2026 1:52:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesIssues]
  @IssueID				  int  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FI.[FileID]
      ,FI.[FileName]
      ,FI.[DocumentumID]
      ,FI.[uploaded_by]
      ,FI.[uploaded_at]
      /*,FI.[IsActive]*/
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Issues] FI JOIN
		 [Microsoft_PP_Projects_Dev].[dbo].[UC000420_IssuesFileLink] FLISS ON FLISS.FileId = FI.FileId
	WHERE FLISS.[IsActive] = 0 AND FLISS.[IssueID] = ' + CAST(@IssueID AS nvarchar(255)) +
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FI.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY FI.[FileID],FI.[FileName],FI.[DocumentumID],FI.[uploaded_by],FI.[uploaded_at]/*,FI.[IsActive]*/'
     + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FI.[uploaded_at]' END
      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
	  @IssueID					  int,
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @IssueID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END

SQL - 40
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesPlot]    Script Date: 10/14/2026 1:52:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesPlot]
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
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND FPLT.[MaalemDubaiRef] LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPLT.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPLT.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
      + CASE WHEN @ConsultantName IS NOT NULL AND @ConsultantName <> '' THEN N' AND CON.ConsultantName LIKE ''%' + @ConsultantName + '%''' ELSE N'' END
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

SQL - 41
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesPPR_IGNORE]    Script Date: 10/14/2026 1:53:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesPPR_IGNORE]
  @FileName				  nvarchar(255)  = NULL,
  @PPRID      int  = NULL,
  @Status				  int  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPPR.[FileID]
      ,FPPR.[FileName]
      ,FPPR.[DocumentumID]
      ,FPPR.[uploaded_by]
      ,FPPR.[uploaded_at]
      ,PPRFL.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PPR] FPPR JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPRFileLink] PPRFL ON PPRFL.[FileID] = FPPR.[FileID]
	WHERE PPRFL.[PPRID] = ' + CAST(@PPRID AS nvarchar(255)) +
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPPR.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND PPRFL.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FPPR.[FileID],FPPR.[FileName],FPPR.[DocumentumID],FPPR.[uploaded_by],FPPR.[uploaded_at],PPRFL.[IsActive]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FPPR.[uploaded_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
      @FileName            nvarchar(255),
      @PPRID         int,
	    @Status				  int,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @PPRID,
	    @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END

SQL - 42
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesPresentation]    Script Date: 10/14/2026 1:53:16 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesPresentation]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPRES.[FileID]
      ,FPRES.[FileName]
      ,FPRES.[DocumentumID]
      ,FPRES.[uploaded_by]
      ,FPRES.[uploaded_at]
      ,FPRES.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Presentation] FPRES
	WHERE FPRES.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPRES.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPRES.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

SQL - 43
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesProjectHistory_IGNORE]    Script Date: 10/14/2026 1:53:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesProjectHistory_IGNORE]
  @FileName				  nvarchar(255)  = NULL,
  @HistoryDate nvarchar(255)  = NULL,
  @MaalemDubaiRef		  nvarchar(255)  = NULL,
  @DocumentumID			  nvarchar(255)  = NULL,
  @PTPLetterReceived nvarchar(255)  = NULL,
  @MPLetterRef nvarchar(255)  = NULL,
  @PTPReplytoParty nvarchar(255)  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPTP.[FileID]
      ,FPTP.[FileName]
      ,FPTP.[DocumentumID]
	  ,PH.[RowID]
      ,PH.[HistoryDate]
      ,PH.[PTPLetterReceived]
      ,PH.[MPLetterRef]
      ,PH.[PTPReplytoParty]
      ,PH.[ALTERd_by]
      ,PH.[ALTERd_at]
      ,PH.[updated_by]
      ,PH.[updated_at]
      ,PH.[IsActive]
      ,FPTP.[uploaded_by]
      ,FPTP.[uploaded_at]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PTPReply] FPTP JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistory] PH ON PH.[FileID] = FPTP.[FileID]
	WHERE PH.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @FileName IS NOT NULL THEN N' AND FPTP.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL THEN N' AND FPTP.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
      + CASE WHEN @PTPLetterReceived IS NOT NULL THEN N' AND PH.PTPLetterReceived LIKE ''%' + @PTPLetterReceived + '%''' ELSE N'' END
      + CASE WHEN @MPLetterRef IS NOT NULL THEN N' AND PH.MPLetterRef LIKE ''%' + @MPLetterRef + '%''' ELSE N'' END
      + CASE WHEN @PTPReplytoParty IS NOT NULL THEN N' AND PH.PTPReplytoParty LIKE ''%' + @PTPReplytoParty + '%''' ELSE N'' END
      + CASE WHEN @HistoryDate IS NOT NULL THEN N' AND  CAST(PH.[HistoryDate] AS DATE) = CAST((TRY_CONVERT(datetime2, ''' + @HistoryDate + ''', 120)) AS date)' ELSE N'' END
	    + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND PH.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	    + N' GROUP BY FPTP.[FileID],FPTP.[FileName],FPTP.[DocumentumID],PH.[HistoryDate],PH.[PTPLetterReceived],PH.[MPLetterRef],PH.[PTPReplytoParty],PH.[ALTERd_by],PH.[ALTERd_at],PH.[updated_by],PH.[updated_at],PH.[IsActive],FPTP.[uploaded_by],FPTP.[uploaded_at]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PH.[ALTERd_at]' END

      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END

      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
  @FileName				  nvarchar(255),
  @HistoryDate nvarchar(255),
  @MaalemDubaiRef		  nvarchar(255),
  @DocumentumID			  nvarchar(255),
  @PTPLetterReceived nvarchar(255),
  @MPLetterRef nvarchar(255),
  @PTPReplytoParty nvarchar(255),
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @FileName,
      @HistoryDate,
      @MaalemDubaiRef,
	  @DocumentumID,
  @PTPLetterReceived,
  @MPLetterRef,
  @PTPReplytoParty,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END

SQL - 44
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesProjectLayout]    Script Date: 10/14/2026 1:53:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesProjectLayout]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPL.[FileID]
      ,FPL.[FileName]
      ,FPL.[DocumentumID]
      ,FPL.[uploaded_by]
      ,FPL.[uploaded_at]
      ,FPL.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ProjectLayout] FPL
	WHERE FPL.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FPL.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPL.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

SQL - 45
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesProjHistory]    Script Date: 10/14/2026 1:53:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesProjHistory]
  @PHID				  int  = NULL,
  @Status				  bit  = NULL,
  @OrderByColumn          nvarchar(255)  = NULL,
  @SortType               nvarchar(255)  = NULL,
  @PageSize               int            = NULL,
  @PageNumber             int            = NULL
AS
BEGIN
  SET NOCOUNT ON;
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FPTP.[FileID]
      ,FPTP.[FileName]
      ,FPTP.[DocumentumID]
      ,FPTP.[uploaded_by]
      ,FPTP.[uploaded_at]
      ,FPTP.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PTPReply] FPTP
	WHERE FPTP.[PHID] = ' + CAST(@PHID AS nvarchar(255)) +
	  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND FPTP.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
	  + N' GROUP BY FPTP.[FileID],FPTP.[FileName],FPTP.[DocumentumID],FPTP.[uploaded_by],FPTP.[uploaded_at],FPTP.[IsActive]'
     + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' FPTP.[uploaded_at]' END
      + CASE WHEN @SortType IS NOT NULL THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 

    DECLARE @params nvarchar(max) = N'
	  @PHID					  int,
	  @Status				  bit,
      @OrderByColumn          nvarchar(255),
      @SortType               nvarchar(255),
      @PageSize               int,
      @PageNumber             int';
 
	EXEC sys.sp_executesql @sql, @params, 
      @PHID,
	  @Status,
      @OrderByColumn,
      @SortType,
      @PageSize,
      @PageNumber

END

SQL - 46
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewFilesZoning]    Script Date: 10/14/2026 1:53:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewFilesZoning]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT FZ.[FileID]
      ,FZ.[FileName]
      ,FZ.[DocumentumID]
      ,FZ.[uploaded_by]
      ,FZ.[uploaded_at]
      ,FZ.[IsActive]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Zoning] FZ
	WHERE FZ.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @FileName IS NOT NULL AND @FileName <> '' THEN N' AND FZ.[FileName] LIKE ''%' + @FileName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FZ.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

SQL - 47
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewPlotDetails]    Script Date: 10/14/2026 1:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- DROP PROCEDURE [sp_UC000420_ViewPlotDetails];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewPlotDetails]
  @RowID        int  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
   SELECT  PLT.[MaalemDubaiRef]
          ,PLT.[DevPlotNum]
          ,PLT.[DMPlotNum]
          ,PLT.[PlotOwnerName]
          ,PLT.[PlotProjectName]
          ,PLT.[PowerDensity]
          ,PLT.[GFA]
          ,PLT.[LandUse]
          ,PLT.[PlotStatus]
          ,PLT.[ExpPowerReq]
          ,PLT.[GenaralLoad]
          ,PLT.[LocalizedCoolingLoad]
          ,PLT.[DCP]
          ,PLT.[TotalConnectedLoad]

          ,PLT.[InitDevSubCommDate]

          ,PLT.[UltDevSubCommDate]
          ,PLT.[NOCRelease]
          ,PLT.[FileID]
          ,PLT.[ALTERd_at]
          ,PLT.[ALTERd_by]
          ,PLT.[updated_at]
          ,PLT.[updated_by]
          ,CON.[ConsultantID]
          ,CON.[ConsultantName]
          ,DEV.[DeveloperID]
          ,DEV.[DeveloperName]
		  ,PLT.[IsActive]
		  ,PLT.[EVChargerLoad]
		  ,PLT.[DataCenterLoad]
		  ,PLT.[SolarLoad]
		  ,PLT.[IndustrialLoad]
		  ,PLT.[LightingLoad]
		  ,PLT.[AgritechLoad]
		  ,PLT.[OtherLoads]
		  ,CONCAT(''https://bayanat.dewa.gov.ae/asas/?query=ASAS_9839_3,PARCELID,'', PLT.DMPlotNum) AS GISUrl

  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
        [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
        [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON DEV.DeveloperID = MPT.DeveloperID JOIN
        [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID = PLT.ConsultantID
  WHERE PLT.[RowID] = ' + CAST(@RowID AS nvarchar(255))
 
    DECLARE @params nvarchar(max) = N'
	  @RowID        nvarchar(255)';
 
	-- PRINT @sql

	EXEC sys.sp_executesql @sql, @params,
	  @RowID

END

SQL - 48
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewPlotDetails_SO]    Script Date: 10/14/2026 1:54:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- DROP PROCEDURE [sp_UC000420_ViewPlotDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewPlotDetails_SO]
  @DevPlotNum		 nvarchar(255)  = NULL,
  @DMPlotNum		 nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT MPT.MaalemDubaiRef
        ,MPT.ProjectName
        ,DEV.DeveloperName
		,CON.ConsultantName
		,PLT.TotalConnectedLoad
        ,PLT.LandUse
		,PLT.InitDEWASubFullName
        ,PLT.UltDEWASubFullName
        ,PLT.UltDevSubCommDate
        ,PLT.NOCRelease
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID JOIN
  WHERE 1=1'
      + CASE WHEN @DevPlotNum IS NOT NULL THEN N' AND PLT.DevPlotNum LIKE ''%' + @DevPlotNum + '%''' ELSE N'' END
      + CASE WHEN @DMPlotNum IS NOT NULL THEN N' AND PLT.DMPlotNum LIKE ''%' + @DMPlotNum + '%''' ELSE N'' END
      + N' GROUP BY MPT.MaalemDubaiRef,MPT.ProjectName,DEV.DeveloperName,CON.ConsultantName,PLT.TotalConnectedLoad,PLT.LandUse,PLT.InitDEWASubFullName,PLT.UltDEWASubFullName,PLT.UltDevSubCommDate,PLT.NOCRelease;';
 
    DECLARE @params nvarchar(max) = N'
      @DevPlotNum         nvarchar(255),
      @DMPlotNum         nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @DevPlotNum,
      @DMPlotNum

END

SQL - 49
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewPlotDetails_SO_Test]    Script Date: 10/14/2026 1:54:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- DROP PROCEDURE [sp_UC000420_ViewPlotDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewPlotDetails_SO_Test]
  @RowID        int  = NULL
AS
BEGIN
  SET NOCOUNT ON;

   SELECT  PLT.[MaalemDubaiRef]
          ,PLT.[DevPlotNum]
          ,PLT.[DMPlotNum]
          ,PLT.[PlotOwnerName]
          ,PLT.[PlotProjectName]
          ,PLT.[PowerDensity]
          ,PLT.[GFA]
          ,PLT.[LandUse]
          ,PLT.[PlotStatus]
          ,PLT.[ExpPowerReq]
          ,PLT.[GenaralLoad]
          ,PLT.[LocalizedCoolingLoad]
          ,PLT.[DCP]
          ,PLT.[TotalConnectedLoad]
          ,PLT.[InitDevSubCommDate]
          ,PLT.[UltDevSubCommDate]
          ,PLT.[NOCRelease]
          ,CON.[ConsultantName]
          ,DEV.[DeveloperName]
		  ,PLT.[EVChargerLoad]
		  ,PLT.[DataCenterLoad]
		  ,PLT.[SolarLoad]
		  ,PLT.[IndustrialLoad]
		  ,PLT.[LightingLoad]
		  ,PLT.[AgritechLoad]
		  ,PLT.[OtherLoads]
		  ,DEVI.[FileName]
	      ,DEVI.[DocuFileName]
		  ,CONCAT('https://bayanat.dewa.gov.ae/asas/?query=ASAS_9839_3,PARCELID,', PLT.DMPlotNum) AS GISUrl
		  ,MPT.[ProjectName]
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
        [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
        [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON DEV.DeveloperID = MPT.DeveloperID LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_DevImages] DEVI ON DEVI.FileID = DEV.FileId JOIN
        [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON CON.ConsultantID = PLT.ConsultantID
  WHERE PLT.[RowID] = @RowID


    DECLARE @InitSubId int = 0;
  DECLARE @InitSubName varchar(255) = NULL;
  DECLARE @UltSubId int = 0;
  DECLARE @UltSubName varchar(255) = NULL;


  DECLARE @sql nvarchar(max) = N'
    SELECT @InitSubId = PLT.[InitSubID]
		,@InitSubName = SUB.[SubstationName]
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.[SubstationID] = PLT.[InitSubID]
  WHERE PLT.RowID = ' + CAST(@RowID AS nvarchar(255)) + '
  GROUP BY PLT.[InitSubID], SUB.[SubstationName];'

	DECLARE @params nvarchar(max) = N'
	@RowID         int,
	@InitSubId	int OUT,
	@InitSubName	varchar(255) OUT';

	EXEC sys.sp_executesql @sql, @params, 
		@RowID,
		@InitSubId OUT,
		@InitSubName OUT


  DECLARE @sql2 nvarchar(max) = N'
    SELECT @UltSubId = PLT.[UltSubID]
		,@UltSubName = SUB.[SubstationName]
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.[SubstationID] = PLT.[UltSubID]
  WHERE PLT.RowID = ' + CAST(@RowID AS nvarchar(255)) + '
  GROUP BY PLT.[UltSubID], SUB.[SubstationName];'

	DECLARE @params2 nvarchar(max) = N'
	@RowID         int,
	@UltSubId	int OUT,
	@UltSubName	varchar(255) OUT';

	EXEC sys.sp_executesql @sql2, @params2, 
		@RowID,
		@UltSubId OUT,
		@UltSubName OUT

/***
  SELECT @InitSubId AS 'InitSubId'
		,@InitSubName AS 'InitSubSCADAName'
		,@UltSubId AS 'UltSubId'
		,@UltSubName AS 'UltSubSCADAName'
		***/
	SELECT @InitSubName AS 'InitSubSCADAName'
		,@UltSubName AS 'UltSubSCADAName'
END

SQL - 50
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewPlotSubstations]    Script Date: 10/14/2026 1:54:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






-- DROP PROCEDURE [sp_UC000420_ViewConProjStats];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewPlotSubstations]
  @RowID			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @InitSubId int = 0;
  DECLARE @InitSubName varchar(255) = NULL;
  DECLARE @UltSubId int = 0;
  DECLARE @UltSubName varchar(255) = NULL;


  DECLARE @sql nvarchar(max) = N'
    SELECT @InitSubId = PLT.[InitSubID]
		,@InitSubName = SUB.[SubstationName]
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.[SubstationID] = PLT.[InitSubID]
  WHERE PLT.RowID = ' + CAST(@RowID AS nvarchar(255)) + '
  GROUP BY PLT.[InitSubID], SUB.[SubstationName];'

	DECLARE @params nvarchar(max) = N'
	@RowID         int,
	@InitSubId	int OUT,
	@InitSubName	varchar(255) OUT';

	EXEC sys.sp_executesql @sql, @params, 
		@RowID,
		@InitSubId OUT,
		@InitSubName OUT




  DECLARE @sql2 nvarchar(max) = N'
    SELECT @UltSubId = PLT.[UltSubID]
		,@UltSubName = SUB.[SubstationName]
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.[SubstationID] = PLT.[UltSubID]
  WHERE PLT.RowID = ' + CAST(@RowID AS nvarchar(255)) + '
  GROUP BY PLT.[UltSubID], SUB.[SubstationName];'

	DECLARE @params2 nvarchar(max) = N'
	@RowID         int,
	@UltSubId	int OUT,
	@UltSubName	varchar(255) OUT';

	EXEC sys.sp_executesql @sql2, @params2, 
		@RowID,
		@UltSubId OUT,
		@UltSubName OUT


  SELECT @InitSubId AS 'InitSubId'
		,@InitSubName AS 'InitSubSCADAName'
		,@UltSubId AS 'UltSubId'
		,@UltSubName AS 'UltSubSCADAName'

END

SQL - 51
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjDetails]    Script Date: 10/14/2026 1:54:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjDetails]
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
      ,MPT.[ALTERd_at]
      ,MPT.[ALTERd_by]
      ,MPT.[updated_at]
      ,MPT.[updated_by]
      ,MPT.[IsActive]
      ,MPT.[MaalemDubaiNo]
      ,DEV.[DeveloperName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON DEV.DeveloperID = MPT.DeveloperID
  WHERE MPT.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
 
    DECLARE @params nvarchar(max) = N'
	  @MaalemDubaiRef        nvarchar(255)';
 
	-- PRINT @sql

	EXEC sys.sp_executesql @sql, @params,
	  @MaalemDubaiRef

END

SQL - 52
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjDetails_SO]    Script Date: 10/14/2026 1:54:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjDetails_SO]
  @MaalemDubaiRef        nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;

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
      ,MPT.[SS400kV]
      ,MPT.[SS132kV]
      ,MPT.[Zone]
      ,MPT.[SubZone]
      ,MPT.[BuiltPerc]
      ,MPT.[UCPerc]
      ,MPT.[VPerc]
      ,MPT.[SS132kVExisting]
      ,MPT.[ProjectCategory]
      ,MPT.[MaalemDubaiNo]
      ,DEV.[DeveloperName]
	  ,DEVI.[FileName]
	  ,DEVI.[DocuFileName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON DEV.DeveloperID = MPT.DeveloperID LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_DevImages] DEVI ON DEVI.FileID = DEV.FileId
  WHERE MPT.[MaalemDubaiRef] = @MaalemDubaiRef
 
 SELECT SUB.SubstationName
		,KVSS.[Status]
		,SUB.[SubstationSCADAName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ExistingKVSS] KVSS JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON KVSS.SubstationID = SUB.SubstationID
  WHERE KVSS.[MaalemDubaiRef] = @MaalemDubaiRef AND KVSS.[IsActive] = 1
  ORDER BY KVSS.[updated_at] ASC


  SELECT PFY.[ProjectYear]
      ,PFY.[Remark]
      ,SUB.[SubstationName]
      ,PFY.[Status]
	  ,SUB.[SubstationSCADAName]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsFutureYears] PFY JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON PFY.SubstationID = SUB.SubstationID
  WHERE PFY.[MaalemDubaiRef] = @MaalemDubaiRef AND PFY.[IsActive] = 1
  ORDER BY PFY.[updated_at] ASC

    SELECT PR.[MaalemDubaiRef]
      ,PR.[Remarks]
	  ,PR.[updated_at]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsRemarks] PR
  WHERE PR.[MaalemDubaiRef] = @MaalemDubaiRef AND PR.[IsActive] = 1
  ORDER BY PR.[updated_at] ASC

  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

  SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT) 
      ,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
	  ,@TotalPlots = SUM(PLOTS)
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1 AND MaalemDubaiRef = @MaalemDubaiRef

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

END

SQL - 53
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjDetails_SO_Test]    Script Date: 10/14/2026 1:54:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjDetails_SO_Test]
  @MaalemDubaiRef        nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;

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
      ,MPT.[SS400kV]
      ,MPT.[SS132kV]
      ,MPT.[Zone]
      ,MPT.[SubZone]
      ,MPT.[BuiltPerc]
      ,MPT.[UCPerc]
      ,MPT.[VPerc]
      ,MPT.[SS132kVExisting]
      ,MPT.[ProjectCategory]
      ,MPT.[MaalemDubaiNo]
      ,DEV.[DeveloperName]
	  ,DEVI.[FileName]
	  ,DEVI.[DocuFileName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON DEV.DeveloperID = MPT.DeveloperID LEFT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_DevImages] DEVI ON DEVI.FileID = DEV.FileId
  WHERE MPT.[MaalemDubaiRef] = @MaalemDubaiRef
 
 SELECT SUB.SubstationName
		,KVSS.[Status]
		,SUB.[SubstationSCADAName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ExistingKVSS] KVSS JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON KVSS.SubstationID = SUB.SubstationID
  WHERE KVSS.[MaalemDubaiRef] = @MaalemDubaiRef AND KVSS.[IsActive] = 1
  ORDER BY KVSS.[updated_at] ASC


  SELECT PFY.[ProjectYear]
      ,PFY.[Remark]
      ,SUB.[SubstationName]
      ,PFY.[Status]
	  ,SUB.[SubstationSCADAName]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsFutureYears] PFY JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON PFY.SubstationID = SUB.SubstationID
  WHERE PFY.[MaalemDubaiRef] = @MaalemDubaiRef AND PFY.[IsActive] = 1
  ORDER BY PFY.[updated_at] ASC

    SELECT PR.[MaalemDubaiRef]
      ,PR.[Remarks]
	  ,PR.[updated_at]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsRemarks] PR
  WHERE PR.[MaalemDubaiRef] = @MaalemDubaiRef AND PR.[IsActive] = 1
  ORDER BY PR.[updated_at] ASC

  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

  SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT) 
      ,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
	  ,@TotalPlots = SUM(PLOTS)
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalProjectStats] WHERE IsActive = 1 AND MaalemDubaiRef = @MaalemDubaiRef

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

END

SQL - 54
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjExistingKVSS]    Script Date: 10/14/2026 1:55:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjExistingKVSS]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT KVSS.RowId
		,SUB.SubstationName
		,KVSS.[Status]
		,KVSS.[ALTERd_at]
		,KVSS.[ALTERd_by]
		,KVSS.[updated_at]
		,KVSS.[updated_by]
		,KVSS.[IsActive]
		,SUB.SubstationID
		,SUB.[SubstationSCADAName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ExistingKVSS] KVSS JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON KVSS.SubstationID = SUB.SubstationID
  WHERE KVSS.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' KVSS.[ALTERd_at]' END
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

SQL - 55
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjFiles_SO]    Script Date: 10/14/2026 1:55:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjFiles_SO]
  @MaalemDubaiRef        nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT FAM.[FileName]
      ,FAM.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaMap] FAM
	WHERE FAM.[MaalemDubaiRef] = @MaalemDubaiRef AND FAM.[IsActive] = 1

	SELECT FAR.[FileName]
      ,FAR.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaReport] FAR
	WHERE FAR.[MaalemDubaiRef] = @MaalemDubaiRef AND FAR.[IsActive] = 1


	SELECT FPRES.[FileName]
      ,FPRES.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Presentation] FPRES
	WHERE FPRES.[MaalemDubaiRef] = @MaalemDubaiRef AND FPRES.[IsActive] = 1

	SELECT FZ.[FileName]
      ,FZ.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Zoning] FZ
	WHERE FZ.[MaalemDubaiRef] = @MaalemDubaiRef AND FZ.[IsActive] = 1

	SELECT FPL.[FileName]
      ,FPL.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ProjectLayout] FPL
	WHERE FPL.[MaalemDubaiRef] = @MaalemDubaiRef AND FPL.[IsActive] = 1

	SELECT ISS.[Description]
	  ,FISS.[DocumentumID]
	  ,FISS.[FileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Issues] ISS FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_IssuesFileLink] ISSFL ON ISSFL.IssueId = ISS.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Issues] FISS ON FISS.[FileID] = ISSFL.[FileID]
	WHERE ISSFL.[IsActive] = 1 AND ISS.[MaalemDubaiRef] = @MaalemDubaiRef AND ISS.[IsActive] = 1
	GROUP BY ISS.[Description],FISS.[DocumentumID],FISS.[FileName]


	SELECT PH.[HistoryDate]
	  ,PH.[PTPLetterReceived]
	  ,PH.[MPLetterRef]
	  ,FPTP.[DocumentumID]
	  ,FPTP.[FileName] AS 'PTPReplyToParty'
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistory] PH FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistoryFileLink] PHFL ON PHFL.ProjectHistId = PH.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PTPReply] FPTP ON FPTP.[FileID] = PHFL.[FileID]
	WHERE PHFL.[IsActive] = 1 AND PH.[MaalemDubaiRef] = @MaalemDubaiRef


	SELECT FPPR.[DocumentumID]
	  ,SUB.SubstationName
	  ,FPPR.[FileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPR] PPR FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPRFileLink] PPRFL ON PPRFL.PPRId = PPR.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PPR] FPPR ON FPPR.[FileID] = PPRFL.[FileID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PPR.SubstationID
	WHERE PPRFL.[IsActive] = 1 AND PPR.[MaalemDubaiRef] = @MaalemDubaiRef

END

SQL - 56
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjFiles_SO_Test]    Script Date: 10/14/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjFiles_SO_Test]
  @MaalemDubaiRef        nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT FAM.[FileName]
      ,FAM.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaMap] FAM
	WHERE FAM.[MaalemDubaiRef] = @MaalemDubaiRef AND FAM.[IsActive] = 1

	SELECT FAR.[FileName]
      ,FAR.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_AreaReport] FAR
	WHERE FAR.[MaalemDubaiRef] = @MaalemDubaiRef AND FAR.[IsActive] = 1


	SELECT FPRES.[FileName]
      ,FPRES.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Presentation] FPRES
	WHERE FPRES.[MaalemDubaiRef] = @MaalemDubaiRef AND FPRES.[IsActive] = 1

	SELECT FZ.[FileName]
      ,FZ.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Zoning] FZ
	WHERE FZ.[MaalemDubaiRef] = @MaalemDubaiRef AND FZ.[IsActive] = 1

	SELECT FPL.[FileName]
      ,FPL.[DocumentumID]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_ProjectLayout] FPL
	WHERE FPL.[MaalemDubaiRef] = @MaalemDubaiRef AND FPL.[IsActive] = 1

	SELECT ISS.[Description]
	  ,FISS.[DocumentumID]
	  ,FISS.[FileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Issues] ISS FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_IssuesFileLink] ISSFL ON ISSFL.IssueId = ISS.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Issues] FISS ON FISS.[FileID] = ISSFL.[FileID]
	WHERE ISSFL.[IsActive] = 1 AND ISS.[MaalemDubaiRef] = @MaalemDubaiRef AND ISS.[IsActive] = 1
	GROUP BY ISS.[Description],FISS.[DocumentumID],FISS.[FileName]


	SELECT PH.[HistoryDate]
	  ,PH.[PTPLetterReceived]
	  ,PH.[MPLetterRef]
	  ,FPTP.[DocumentumID]
	  ,FPTP.[FileName] AS 'PTPReplyToParty'
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistory] PH FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistoryFileLink] PHFL ON PHFL.ProjectHistId = PH.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PTPReply] FPTP ON FPTP.[FileID] = PHFL.[FileID]
	WHERE PHFL.[IsActive] = 1 AND PH.[MaalemDubaiRef] = @MaalemDubaiRef


	SELECT FPPR.[DocumentumID]
	  ,SUB.SubstationName
	  ,FPPR.[FileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPR] PPR FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPRFileLink] PPRFL ON PPRFL.PPRId = PPR.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PPR] FPPR ON FPPR.[FileID] = PPRFL.[FileID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PPR.SubstationID
	WHERE PPRFL.[IsActive] = 1 AND PPR.[MaalemDubaiRef] = @MaalemDubaiRef

END

SQL - 57
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjFutureYears]    Script Date: 10/14/2026 1:55:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjFutureYears]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT PFY.[RowId]
	  ,PFY.[ProjectYear]
      ,PFY.[Remark]
      ,SUB.[SubstationName]
      ,PFY.[Status]
      ,PFY.[ALTERd_at]
      ,PFY.[ALTERd_by]
      ,PFY.[updated_at]
      ,PFY.[updated_by]
	  ,PFY.[IsActive]
	  ,SUB.SubstationID
	  ,SUB.[SubstationSCADAName]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsFutureYears] PFY JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON PFY.SubstationID = SUB.SubstationID
  WHERE PFY.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PFY.[ALTERd_at]' END
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

SQL - 58
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjHistory]    Script Date: 10/14/2026 1:55:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjHistory]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT PH.[RowID]
      ,PH.[HistoryDate]
	  ,PH.[PTPLetterReceived]
	  ,PH.[MPLetterRef]
      ,PHFL.[FileID]
	  ,FPTP.[DocumentumID]
      ,PH.[ALTERd_by]
      ,PH.[ALTERd_at]
      ,FPTP.[uploaded_by]
      ,FPTP.[uploaded_at]
      ,PHFL.[IsActive]
	  ,FPTP.[FileName] AS ''PTPReplyToParty''
	  ,FPTP.[DocuFileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistory] PH FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistoryFileLink] PHFL ON PHFL.ProjectHistId = PH.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PTPReply] FPTP ON FPTP.[FileID] = PHFL.[FileID]
	WHERE /*PHFL.[IsActive] = 1 AND*/ PH.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @HistoryDate IS NOT NULL AND @HistoryDate <> '' THEN N' AND PH.[HistoryDate] LIKE ''%' + @HistoryDate + '%''' ELSE N'' END
	  + CASE WHEN @PTPLetterReceived IS NOT NULL AND @PTPLetterReceived <> '' THEN N' AND PH.[PTPLetterReceived] LIKE ''%' + @PTPLetterReceived + '%''' ELSE N'' END
	  + CASE WHEN @MPLetterRef IS NOT NULL AND @MPLetterRef <> '' THEN N' AND PH.[MPLetterRef] LIKE ''%' + @MPLetterRef + '%''' ELSE N'' END
	  + CASE WHEN @PTPReplytoParty IS NOT NULL AND @PTPReplytoParty <> '' THEN N' AND FPTP.[FileName] LIKE ''%' + @PTPReplytoParty + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPTP.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND PH.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY PH.[RowID],PH.[HistoryDate],PH.[PTPLetterReceived],PH.[MPLetterRef],PHFL.[FileID],FPTP.[DocumentumID],PH.[ALTERd_by],PH.[ALTERd_at],FPTP.[uploaded_by],FPTP.[uploaded_at],PHFL.[IsActive],FPTP.[FileName],FPTP.[DocuFileName]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PH.[ALTERd_at]' END
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

SQL - 59
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjIssues]    Script Date: 10/14/2026 1:55:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjIssues]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT ISS.[RowID]
      ,ISS.[Description]
      ,ISSFL.[FileID]
	  ,FISS.[DocumentumID]
      ,ISS.[ALTERd_by]
      ,ISS.[ALTERd_at]
      ,FISS.[uploaded_by]
      ,FISS.[uploaded_at]
      ,ISS.[IsActive]
	  ,FISS.[FileName]
	  ,FISS.[DocuFileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Issues] ISS FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_IssuesFileLink] ISSFL ON ISSFL.IssueId = ISS.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_Issues] FISS ON FISS.[FileID] = ISSFL.[FileID]
	WHERE ISSFL.[IsActive] = 1 AND ISS.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @Description IS NOT NULL AND @Description <> '' THEN N' AND ISS.[Description] LIKE ''%' + @Description + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FISS.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND ISS.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY ISS.[RowID],ISS.[Description],ISSFL.[FileID],FISS.[DocumentumID],ISS.[ALTERd_by],ISS.[ALTERd_at],FISS.[uploaded_by],FISS.[uploaded_at],ISS.[IsActive],FISS.[FileName],FISS.[DocuFileName]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' ISS.[ALTERd_at]' END

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

SQL - 60
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjPPR]    Script Date: 10/14/2026 1:56:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- DROP PROCEDURE [sp_UC000420_SearchProjects];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjPPR]
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
 
  DECLARE @sql nvarchar(max) = N'
    SELECT PPR.[RowID]
      ,PPR.[SubstationID]
      ,PPRFL.[FileID]
	  ,FPPR.[DocumentumID]
	  ,SUB.SubstationName
      ,PPR.[ALTERd_by]
      ,PPR.[ALTERd_at]
      ,FPPR.[uploaded_by]
      ,FPPR.[uploaded_at]
      ,PPRFL.[IsActive]
	  ,FPPR.[FileName]
	  ,FPPR.[DocuFileName]
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPR] PPR FULL JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPRFileLink] PPRFL ON PPRFL.PPRId = PPR.[RowID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Files_PPR] FPPR ON FPPR.[FileID] = PPRFL.[FileID] JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON SUB.SubstationID = PPR.SubstationID
	WHERE /*PPRFL.[IsActive] = 1 AND*/ PPR.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%' + @SubstationName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPPR.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
	  /*+ COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND PPR.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')*/
	  + N' GROUP BY PPR.[RowID],PPR.[SubstationID],PPRFL.[FileID],FPPR.[DocumentumID],SUB.SubstationName,PPR.[ALTERd_by],PPR.[ALTERd_at],FPPR.[uploaded_by],FPPR.[uploaded_at],PPRFL.[IsActive],FPPR.[FileName],FPPR.[DocuFileName]'
      + N' ORDER BY' + CASE WHEN @OrderByColumn IS NOT NULL THEN N' ' + @OrderByColumn ELSE N' PPR.[ALTERd_at]' END

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
SQL - 61
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewProjSubstations_SO]    Script Date: 10/14/2026 1:57:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_SearchDevelopers];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjSubstations_SO]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)  = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
      SELECT   PLT.UltDEWASubFullName
              ,PLT.UltDevSubCommDate
      FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT
      WHERE PLT.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + '''  AND (PLT.UltDEWASubFullName IS NOT NULL OR PLT.UltDevSubCommDate IS NOT NULL)'
      + N' GROUP BY PLT.UltDEWASubFullName, PLT.UltDevSubCommDate'
      + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL THEN
        N' ' + @OrderByColumn ELSE N' PLT.UltDEWASubFullName' END
      + CASE WHEN @SortType IS NOT NULL THEN
        N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
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

SQL - 62
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSettings_TCL]    Script Date: 10/14/2026 1:57:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_ViewSettings_TCL];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSettings_TCL]
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)    = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT [LimitID]
      ,[LimitAmount]
      ,[LimitDesc]
      ,[ALTERd_at]
      ,[ALTERd_by]
      ,[updated_at]
      ,[updated_by]
      ,[IsActive]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL]'
	    + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL AND @OrderByColumn <> '' THEN N' ' + @OrderByColumn ELSE N' [ALTERd_at]' END
      + CASE WHEN @SortType IS NOT NULL AND @SortType <> '' THEN N' ' + @SortType ELSE N' ASC' END
      + N' OFFSET ' + CAST(@PageSize * (@PageNumber - 1) AS nvarchar(255)) + 'ROWS
           FETCH NEXT ' + CAST(@PageSize AS nvarchar(255)) + ' ROWS ONLY OPTION (RECOMPILE);';
 
    DECLARE @params nvarchar(max) = N'
      @OrderByColumn         nvarchar(255),
      @SortType              nvarchar(255),
      @PageSize              int,
      @PageNumber            int';
 
	EXEC sys.sp_executesql @sql, @params,
	  @OrderByColumn,
	  @SortType,
	  @PageSize,
	  @PageNumber

END

SQL - 63
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubDetails_SO]    Script Date: 10/14/2026 1:57:47 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_ViewSubstationDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubDetails_SO]
  @SubstationId	 int  = NULL
AS
BEGIN
  SET NOCOUNT ON;


 SELECT SUB.[SubstationName]
      ,SUB.[SubstationSCADAName]
      ,SUB.[BuiltBy]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB
  WHERE SUB.[SubstationID] = @SubstationId

  SELECT TCL.LimitDesc
      ,TCL.LimitAmount
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBTCL JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] TCL ON TCL.LimitID = SUBTCL.LimitID
  WHERE SUBTCL.[SubstationID] = @SubstationId AND SUBTCL.[IsActive] = 1


  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

   SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT)
	,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
	,@TotalPlots = SUM(PLOTS)
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalSubstationStats]
	WHERE IsActive = 1 AND (InitSubId = @SubstationId OR UltSubId = @SubstationId)

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

  SELECT MPT.MaalemDubaiRef, MPT.ProjectName, COUNT(PLT.RowID) AS TotalPlots, SUM(PLT.TotalConnectedLoad)/1000 AS TCL
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN [Microsoft_PP_Projects_Dev].[dbo].UC000420_MasterProjectTable MPT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE PLT.InitSubID = @SubstationId
  GROUP BY MPT.MaalemDubaiRef, MPT.ProjectName

END

SQL - 64
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubDetails_SO_Test]    Script Date: 10/14/2026 1:57:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_ViewSubstationDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubDetails_SO_Test]
  @SubstationId	 int  = NULL
AS
BEGIN
  SET NOCOUNT ON;


 SELECT SUB.[SubstationName]
      ,SUB.[SubstationSCADAName]
      ,SUB.[BuiltBy]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB
  WHERE SUB.[SubstationID] = @SubstationId

  SELECT TCL.LimitDesc
      ,TCL.LimitAmount
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBTCL JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] TCL ON TCL.LimitID = SUBTCL.LimitID
  WHERE SUBTCL.[SubstationID] = @SubstationId AND SUBTCL.[IsActive] = 1


  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

   SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT)
	,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
	,@TotalPlots = SUM(PLOTS)
	FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalSubstationStats]
	WHERE IsActive = 1 AND (InitSubId = @SubstationId OR UltSubId = @SubstationId)

  SELECT @TotalDCP AS DCP, @TotalTCL AS TCL , @TotalPlots AS PLOTS;

  SELECT MPT.MaalemDubaiRef, MPT.ProjectName, COUNT(PLT.RowID) AS TotalPlots, SUM(PLT.TotalConnectedLoad)/1000 AS TCL
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT JOIN [Microsoft_PP_Projects_Dev].[dbo].UC000420_MasterProjectTable MPT ON PLT.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE PLT.InitSubID = @SubstationId
  GROUP BY MPT.MaalemDubaiRef, MPT.ProjectName

END

SQL - 65
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubstation_Details]    Script Date: 10/14/2026 1:58:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_ViewSubstationDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubstation_Details]
  @SubstationId	 int  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
SELECT SUB.[SubstationID]
      ,SUB.[SubstationName]
      ,SUB.[SubstationSCADAName]
      ,SUB.[BuiltBy]
      ,SUB.[IsActive]
      ,SUB.[ALTERd_at]
      ,SUB.[ALTERd_by]
      ,SUB.[updated_at]
      ,SUB.[updated_by]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB
  WHERE SUB.[SubstationID] =' + CAST(@SubstationId AS nvarchar(255));
 
    DECLARE @params nvarchar(max) = N'
      @SubstationId         int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @SubstationId

END

SQL - 66
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubstation_Limits]    Script Date: 10/14/2026 1:58:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_ViewSubstationDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubstation_Limits]
  @SubstationId	 int  = NULL,
  @Status	 int  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
SELECT TCL.LimitID
	  ,TCL.LimitDesc
      ,TCL.LimitAmount
      ,SUBTCL.[ALTERd_at]
      ,SUBTCL.[ALTERd_by]
      ,SUBTCL.[updated_at]
      ,SUBTCL.[updated_by]
      ,SUBTCL.[IsActive]
  FROM  [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBTCL JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] TCL ON TCL.LimitID = SUBTCL.LimitID
  WHERE SUBTCL.[SubstationID] =' + CAST(@SubstationId AS nvarchar(255))
  + COALESCE(CASE WHEN @Status IS NOT NULL THEN N' AND SUBTCL.[IsActive] = ' + CAST(@Status AS nvarchar(255)) END, '')
 
    DECLARE @params nvarchar(max) = N'
      @SubstationId         int,
	  @Status				int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @SubstationId,
	  @Status

END

SQL - 67
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubstationDetails_IGNORE]    Script Date: 10/14/2026 1:58:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DROP PROCEDURE [sp_UC000420_ViewSubstationDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubstationDetails_IGNORE]
  @SubstationId	 int  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
SELECT SUB.[SubstationID]
      ,SUB.[SubstationName]
      ,SUB.[SubstationSCADAName]
      ,SUB.[BuiltBy]
      ,TCL.LimitDesc
      ,TCL.LimitAmount
      ,SUB.[IsActive]
      ,SUB.[ALTERd_at]
      ,SUB.[ALTERd_by]
      ,SUB.[updated_at]
      ,SUB.[updated_by]
	  ,TCL.LimitID
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBTCL ON SUBTCL.SubstationID = SUB.SubstationID JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] TCL ON TCL.LimitID = SUBTCL.LimitID
  WHERE TCL.LimitID = 1 AND SUB.[SubstationID] =' + CAST(@SubstationId AS nvarchar(255));
 
    DECLARE @params nvarchar(max) = N'
      @SubstationId         int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @SubstationId

END

SQL - 68
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubstationDetails_SO]    Script Date: 10/14/2026 1:58:29 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- DROP PROCEDURE [sp_UC000420_ViewSubstationDetails_SO];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubstationDetails_SO]
  @SubstationName	 nvarchar(255)  = NULL,
  @SubScadaName		 nvarchar(255)  = NULL
AS
BEGIN
  SET NOCOUNT ON;


  DECLARE @sql nvarchar(max) = N'
  SELECT MPT.MaalemDubaiRef
        ,MPT.ProjectName
        ,DEV.DeveloperName
		,CON.ConsultantName
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV ON MPT.DeveloperID = DEV.DeveloperID JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants] CON ON PLT.ConsultantID = CON.ConsultantID JOIN
  WHERE 1=1'
      + CASE WHEN @SubstationName IS NOT NULL THEN N' AND PLT.DevPlotNum LIKE ''%' + @SubstationName + '%''' ELSE N'' END
      + CASE WHEN @SubScadaName IS NOT NULL THEN N' AND PLT.DMPlotNum LIKE ''%' + @SubScadaName + '%''' ELSE N'' END
      + N' GROUP BY MPT.MaalemDubaiRef,MPT.ProjectName,DEV.DeveloperName,CON.ConsultantName;';
 
    DECLARE @params nvarchar(max) = N'
      @SubstationName         nvarchar(255),
      @SubScadaName         nvarchar(255)';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @SubstationName,
      @SubScadaName

END

SQL - 69
 
USE [Microsoft_PP_Projects_Dev]
GO
/****** Object:  StoredProcedure [dbo].[sp_UC000420_ViewSubStats]    Script Date: 10/14/2026 1:58:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- DROP PROCEDURE [sp_UC000420_ViewConProjStats];
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubStats]
  @SubId			 int			= NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @TotalPlots int = 0;
  DECLARE @TotalTCL float = 0;
  DECLARE @TotalDCP float = 0;

  DECLARE @sql nvarchar(max) = N'
    SELECT @TotalTCL = CAST(ROUND(SUM(TCL)/1000, 0) AS INT)
      ,@TotalDCP = CAST(ROUND(SUM(DCP)/1000, 0) AS INT)
	  ,@TotalPlots = SUM(PLOTS)
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_View_TotalSubstationStats]
	  WHERE IsActive = 1'
	  + ' AND (InitSubId = ' + CAST(@SubId AS nvarchar(255))
	  + ' OR UltSubId = ' + CAST(@SubId AS nvarchar(255)) + ')'
	  /*+ ' GROUP BY MPT.MaalemDubaiRef, PLT.InitSubID, PLT.UltSubID, PLT.IsActive'*/
	  /*+ COALESCE(CASE WHEN @InitSubId IS NOT NULL AND @InitSubId <> 0  THEN N' AND InitSubId = ' + CAST(@InitSubId AS nvarchar(255)) END, '')
	  + COALESCE(CASE WHEN @UltSubId IS NOT NULL AND @UltSubId <> 0 THEN N' AND UltSubId = ' + CAST(@UltSubId AS nvarchar(255)) END, '')*/

	DECLARE @params nvarchar(max) = N'
	@SubId         int,
	@TotalTCL	float OUT,
	@TotalDCP	float OUT,
	@TotalPlots	float OUT';

	EXEC sys.sp_executesql @sql, @params, 
		@SubId,
		@TotalTCL OUT,
		@TotalDCP OUT,
		@TotalPlots OUT

  /*SELECT @TotalPlots = COUNT(PLT.RowID) 
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT JOIN
	   [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots] PLT ON MPT.MaalemDubaiRef = PLT.MaalemDubaiRef
  WHERE PLT.ConsultantID = @ConsultantID;*/

  SELECT @TotalPlots AS 'TotalPlots'
		,@TotalTCL AS 'TotalTCL'
		,@TotalDCP AS 'TotalDCP'

END
