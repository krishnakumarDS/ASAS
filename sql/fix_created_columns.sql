/*
  Fixes the procedures that select ALTERd_at / ALTERd_by: the tables have created_at / created_by,
  so they fail with "Invalid column name 'ALTERd_at'". Only those two column names change; parameters and results are the same.
  Run in SSMS against Microsoft_PP_Projects_Dev. Procedures covered: ViewDevIssues, ViewPlotDetails, ViewProjDetails, ViewProjExistingKVSS, ViewProjFutureYears, ViewProjHistory, ViewProjIssues, ViewProjPPR, ViewSettings_TCL, ViewSubstation_Details, ViewSubstation_Limits, ViewProjRemarks, ViewSubstationLimitDetails
  Not covered: _IGNORE and _Test copies. The View_TotalProjectStats / View_TotalSubstationStats views are a separate problem (they do not exist).
*/
-- ===== ViewDevIssues =====
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
		,DEVI.created_at
		,DEVI.created_by
		,DEVI.IsActive
  FROM	[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers] DEV JOIN
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_DeveloperIssues] DEVI ON DEV.DeveloperID = DEVI.DeveloperID JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable] MPT ON DEVI.MaalemDubaiRef = MPT.MaalemDubaiRef
  WHERE DEVI.DeveloperID = ' + CAST(@DeveloperID AS nvarchar(255))
      + CASE WHEN @MaalemDubaiRef IS NOT NULL AND @MaalemDubaiRef <> '' THEN N' AND DEVI.MaalemDubaiRef LIKE ''%' + @MaalemDubaiRef + '%''' ELSE N'' END
      + CASE WHEN @ProjectName IS NOT NULL AND @ProjectName <> '' THEN N' AND MPT.ProjectName LIKE ''%' + @ProjectName + '%''' ELSE N'' END
      + CASE WHEN @ALTERdBy IS NOT NULL AND @ALTERdBy <> '' THEN N' AND DEVI.created_by LIKE ''%' + @ALTERdBy + '%''' ELSE N'' END
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

-- ===== ViewPlotDetails =====
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
          ,PLT.[created_at]
          ,PLT.[created_by]
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
GO

-- ===== ViewProjDetails =====
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
      ,MPT.[created_at]
      ,MPT.[created_by]
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
GO

-- ===== ViewProjExistingKVSS =====
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
		,KVSS.[created_at]
		,KVSS.[created_by]
		,KVSS.[updated_at]
		,KVSS.[updated_by]
		,KVSS.[IsActive]
		,SUB.SubstationID
		,SUB.[SubstationSCADAName]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ExistingKVSS] KVSS JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON KVSS.SubstationID = SUB.SubstationID
  WHERE KVSS.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
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

-- ===== ViewProjFutureYears =====
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
      ,PFY.[created_at]
      ,PFY.[created_by]
      ,PFY.[updated_at]
      ,PFY.[updated_by]
	  ,PFY.[IsActive]
	  ,SUB.SubstationID
	  ,SUB.[SubstationSCADAName]
    FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsFutureYears] PFY JOIN 
		[Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB ON PFY.SubstationID = SUB.SubstationID
  WHERE PFY.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
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

-- ===== ViewProjHistory =====
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
	WHERE /*PHFL.[IsActive] = 1 AND*/ PH.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @HistoryDate IS NOT NULL AND @HistoryDate <> '' THEN N' AND PH.[HistoryDate] LIKE ''%' + @HistoryDate + '%''' ELSE N'' END
	  + CASE WHEN @PTPLetterReceived IS NOT NULL AND @PTPLetterReceived <> '' THEN N' AND PH.[PTPLetterReceived] LIKE ''%' + @PTPLetterReceived + '%''' ELSE N'' END
	  + CASE WHEN @MPLetterRef IS NOT NULL AND @MPLetterRef <> '' THEN N' AND PH.[MPLetterRef] LIKE ''%' + @MPLetterRef + '%''' ELSE N'' END
	  + CASE WHEN @PTPReplytoParty IS NOT NULL AND @PTPReplytoParty <> '' THEN N' AND FPTP.[FileName] LIKE ''%' + @PTPReplytoParty + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPTP.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

-- ===== ViewProjIssues =====
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
	WHERE ISSFL.[IsActive] = 1 AND ISS.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @Description IS NOT NULL AND @Description <> '' THEN N' AND ISS.[Description] LIKE ''%' + @Description + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FISS.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

-- ===== ViewProjPPR =====
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
	WHERE /*PPRFL.[IsActive] = 1 AND*/ PPR.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
      + CASE WHEN @SubstationName IS NOT NULL AND @SubstationName <> '' THEN N' AND SUB.[SubstationName] LIKE ''%' + @SubstationName + '%''' ELSE N'' END
      + CASE WHEN @DocumentumID IS NOT NULL AND @DocumentumID <> '' THEN N' AND FPPR.DocumentumID LIKE ''%' + @DocumentumID + '%''' ELSE N'' END
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

-- ===== ViewSettings_TCL =====
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
      ,[created_at]
      ,[created_by]
      ,[updated_at]
      ,[updated_by]
      ,[IsActive]
      FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL]'
	    + N' ORDER BY'
      + CASE WHEN @OrderByColumn IS NOT NULL AND @OrderByColumn <> '' THEN N' ' + @OrderByColumn ELSE N' [created_at]' END
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
GO

-- ===== ViewSubstation_Details =====
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
      ,SUB.[created_at]
      ,SUB.[created_by]
      ,SUB.[updated_at]
      ,SUB.[updated_by]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations] SUB
  WHERE SUB.[SubstationID] =' + CAST(@SubstationId AS nvarchar(255));
 
    DECLARE @params nvarchar(max) = N'
      @SubstationId         int';
 
	EXEC sys.sp_executesql @sql, @params, 
	  @SubstationId

END
GO

-- ===== ViewSubstation_Limits =====
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
      ,SUBTCL.[created_at]
      ,SUBTCL.[created_by]
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
GO

-- ===== ViewProjRemarks =====
USE [Microsoft_PP_Projects_Dev]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewProjRemarks]
  @MaalemDubaiRef        nvarchar(255)  = NULL,
  @OrderByColumn         nvarchar(255)  = NULL,
  @SortType              nvarchar(255)  = NULL,
  @PageSize              int            = NULL,
  @PageNumber            int            = NULL
AS
BEGIN
  SET NOCOUNT ON;

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
  WHERE PR.[MaalemDubaiRef] = ''' + @MaalemDubaiRef + ''''
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

-- ===== ViewSubstationLimitDetails =====
USE [Microsoft_PP_Projects_Dev]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_UC000420_ViewSubstationLimitDetails]
  @SubstationId  int  = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @sql nvarchar(max) = N'
SELECT TCL.LimitAmount
      ,TCL.LimitDesc
      ,SUBTCL.[created_at]
      ,SUBTCL.[created_by]
      ,SUBTCL.[updated_at]
      ,SUBTCL.[updated_by]
      ,SUBTCL.[IsActive]
      ,SUBTCL.[RowId]
  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL] SUBTCL JOIN
       [Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL] TCL ON TCL.LimitID = SUBTCL.LimitID
  WHERE SUBTCL.[SubstationID] =' + CAST(@SubstationId AS nvarchar(255));

  DECLARE @params nvarchar(max) = N'
    @SubstationId         int';

  EXEC sys.sp_executesql @sql, @params,
    @SubstationId
END
GO
