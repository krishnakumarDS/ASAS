/*
  sp_UC000420_Api  --  single entry point for the ASAS Power Automate flow.
  Input:   @action  procedure name WITHOUT the sp_UC000420_ prefix (allow-listed below)
           @json    e.g. {"maalemDubaiRef":"MP-99846-100","pageSize":20,"pageNumber":1,"orderBy":"MPT.created_at","sort":"DESC"}
  JSON keys are the procedure parameter names with the leading capital(s) lower-cased (DMPlotNum -> dmPlotNum).
  Output:  the result sets of the called procedure, unchanged.
  Writes:  an action with a dot, <entity>.<operation> (developer.create, plot.update, project.setActive, substation.delete,
           consultant.get, developer.list ...), is passed to sp_UC000420_Crud. Deploy sp_UC000420_Crud first.
  Not exposed: plot write procedures, *_Test, *_IGNORE, ViewPlotDetails_SO and ViewSubstationDetails_SO (do not compile as written).
  Known source bugs still apply: ViewConsProjects / ViewDevProjects ignore their ID; check ALTERd_at column names in the live DB.
*/
USE [Microsoft_PP_Projects_Dev]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_UC000420_Api]
  @action nvarchar(100),
  @json   nvarchar(max) = N'{}'
AS
BEGIN
  SET NOCOUNT ON;

  IF @action IS NULL OR @action = N'' THROW 50001, 'action is required', 1;
  SET @json = ISNULL(NULLIF(LTRIM(RTRIM(@json)), N''), N'{}');
  IF ISJSON(@json) = 0 THROW 50002, 'json is not valid JSON', 1;

  -- Writes and generic CRUD: an action written "<entity>.<operation>" (for example developer.create or plot.update)
  -- is handed to sp_UC000420_Crud together with the same json. Reads keep using the plain action names below.
  IF CHARINDEX(N'.', @action) > 0
  BEGIN
    DECLARE @crudEntity nvarchar(100) = LEFT(@action, CHARINDEX(N'.', @action) - 1);
    DECLARE @crudOp     nvarchar(100) = SUBSTRING(@action, CHARINDEX(N'.', @action) + 1, 100);
    IF LEN(@crudEntity) > 50 OR LEN(@crudOp) > 20 THROW 50008, 'Unknown entity or operation', 1;
    EXEC dbo.sp_UC000420_Crud @entity = @crudEntity, @operation = @crudOp, @json = @json;
    RETURN;
  END

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
  DECLARE @j_ALTERdBy nvarchar(2000) = JSON_VALUE(@json,'$.alteRdBy');
  DECLARE @j_BuiltBy nvarchar(2000) = JSON_VALUE(@json,'$.builtBy');
  DECLARE @j_ConsultantID_i int = TRY_CAST(JSON_VALUE(@json,'$.consultantID') AS int);
  DECLARE @j_ConsultantName nvarchar(2000) = JSON_VALUE(@json,'$.consultantName');
  DECLARE @j_CreatedBy nvarchar(2000) = JSON_VALUE(@json,'$.createdBy');
  DECLARE @j_DMPlotNum nvarchar(2000) = JSON_VALUE(@json,'$.dmPlotNum');
  DECLARE @j_Day_i int = TRY_CAST(JSON_VALUE(@json,'$.day') AS int);
  DECLARE @j_Description nvarchar(2000) = JSON_VALUE(@json,'$.description');
  DECLARE @j_DevPlotNum nvarchar(2000) = JSON_VALUE(@json,'$.devPlotNum');
  DECLARE @j_DeveloperID_i int = TRY_CAST(JSON_VALUE(@json,'$.developerID') AS int);
  DECLARE @j_DeveloperName nvarchar(2000) = JSON_VALUE(@json,'$.developerName');
  DECLARE @j_DocumentumID nvarchar(2000) = JSON_VALUE(@json,'$.documentumID');
  DECLARE @j_FileName nvarchar(2000) = JSON_VALUE(@json,'$.fileName');
  DECLARE @j_HistoryDate nvarchar(2000) = JSON_VALUE(@json,'$.historyDate');
  DECLARE @j_InitDEWASubFullName nvarchar(2000) = JSON_VALUE(@json,'$.initDEWASubFullName');
  DECLARE @j_InitDEWASubSCADAName nvarchar(2000) = JSON_VALUE(@json,'$.initDEWASubSCADAName');
  DECLARE @j_IssueID_i int = TRY_CAST(JSON_VALUE(@json,'$.issueID') AS int);
  DECLARE @j_LimitAmount_i int = TRY_CAST(JSON_VALUE(@json,'$.limitAmount') AS int);
  DECLARE @j_LimitDesc nvarchar(2000) = JSON_VALUE(@json,'$.limitDesc');
  DECLARE @j_MPLetterRef nvarchar(2000) = JSON_VALUE(@json,'$.mpLetterRef');
  DECLARE @j_MaalemDubaiRef nvarchar(2000) = JSON_VALUE(@json,'$.maalemDubaiRef');
  DECLARE @j_Month_i int = TRY_CAST(JSON_VALUE(@json,'$.month') AS int);
  DECLARE @j_PHID_i int = TRY_CAST(JSON_VALUE(@json,'$.pHID') AS int);
  DECLARE @j_PTPLetterReceived nvarchar(2000) = JSON_VALUE(@json,'$.ptpLetterReceived');
  DECLARE @j_PTPReplytoParty nvarchar(2000) = JSON_VALUE(@json,'$.ptpReplytoParty');
  DECLARE @j_ProjectName nvarchar(2000) = JSON_VALUE(@json,'$.projectName');
  DECLARE @j_RowID_i int = TRY_CAST(JSON_VALUE(@json,'$.rowID') AS int);
  DECLARE @j_Status_b bit = TRY_CAST(JSON_VALUE(@json,'$.status') AS bit);
  DECLARE @j_Status_i int = TRY_CAST(JSON_VALUE(@json,'$.status') AS int);
  DECLARE @j_SubId_i int = TRY_CAST(JSON_VALUE(@json,'$.subId') AS int);
  DECLARE @j_SubstationId_i int = TRY_CAST(JSON_VALUE(@json,'$.substationId') AS int);
  DECLARE @j_SubstationName nvarchar(2000) = JSON_VALUE(@json,'$.substationName');
  DECLARE @j_SubstationSCADAName nvarchar(2000) = JSON_VALUE(@json,'$.substationSCADAName');
  DECLARE @j_Year_i int = TRY_CAST(JSON_VALUE(@json,'$.year') AS int);

  IF @action = N'SearchConsultants'
  BEGIN
    EXEC dbo.sp_UC000420_SearchConsultants
      @ConsultantName = @j_ConsultantName,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'SearchConsultants_Count'
  BEGIN
    EXEC dbo.sp_UC000420_SearchConsultants_Count
      @ConsultantName = @j_ConsultantName;
    RETURN;
  END

  IF @action = N'SearchConsultants_SO'
  BEGIN
    EXEC dbo.sp_UC000420_SearchConsultants_SO
      @ConsultantName = @j_ConsultantName,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'SearchDevelopers'
  BEGIN
    EXEC dbo.sp_UC000420_SearchDevelopers
      @DeveloperName = @j_DeveloperName,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'SearchDevelopers_Count'
  BEGIN
    EXEC dbo.sp_UC000420_SearchDevelopers_Count
      @DeveloperName = @j_DeveloperName;
    RETURN;
  END

  IF @action = N'SearchDevelopers_SO'
  BEGIN
    EXEC dbo.sp_UC000420_SearchDevelopers_SO
      @DeveloperName = @j_DeveloperName,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
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

  IF @action = N'SearchPlots_Count'
  BEGIN
    EXEC dbo.sp_UC000420_SearchPlots_Count
      @ProjectName = @j_ProjectName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DevPlotNum = @j_DevPlotNum,
      @DMPlotNum = @j_DMPlotNum,
      @InitDEWASubFullName = @j_InitDEWASubFullName,
      @InitDEWASubSCADAName = @j_InitDEWASubSCADAName,
      @DeveloperName = @j_DeveloperName,
      @DeveloperID = @j_DeveloperID_i,
      @ConsultantName = @j_ConsultantName,
      @ConsultantID = @j_ConsultantID_i;
    RETURN;
  END

  IF @action = N'SearchPlots_SO'
  BEGIN
    EXEC dbo.sp_UC000420_SearchPlots_SO
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

  IF @action = N'SearchProjects'
  BEGIN
    EXEC dbo.sp_UC000420_SearchProjects
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

  IF @action = N'SearchProjects_Count'
  BEGIN
    EXEC dbo.sp_UC000420_SearchProjects_Count
      @ProjectName = @j_ProjectName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DevPlotNum = @j_DevPlotNum,
      @DMPlotNum = @j_DMPlotNum,
      @InitDEWASubFullName = @j_InitDEWASubFullName,
      @InitDEWASubSCADAName = @j_InitDEWASubSCADAName,
      @DeveloperName = @j_DeveloperName,
      @DeveloperID = @j_DeveloperID_i,
      @ConsultantName = @j_ConsultantName,
      @ConsultantID = @j_ConsultantID_i;
    RETURN;
  END

  IF @action = N'SearchProjects_SO'
  BEGIN
    EXEC dbo.sp_UC000420_SearchProjects_SO
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

  IF @action = N'SearchSubstations'
  BEGIN
    EXEC dbo.sp_UC000420_SearchSubstations
      @SubstationName = @j_SubstationName,
      @SubstationSCADAName = @j_SubstationSCADAName,
      @BuiltBy = @j_BuiltBy,
      @LimitAmount = @j_LimitAmount_i,
      @LimitDesc = @j_LimitDesc,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'SearchSubstations_Count'
  BEGIN
    EXEC dbo.sp_UC000420_SearchSubstations_Count
      @SubstationName = @j_SubstationName,
      @SubstationSCADAName = @j_SubstationSCADAName,
      @BuiltBy = @j_BuiltBy,
      @LimitAmount = @j_LimitAmount_i,
      @LimitDesc = @j_LimitDesc;
    RETURN;
  END

  IF @action = N'SearchSubstations_SO'
  BEGIN
    EXEC dbo.sp_UC000420_SearchSubstations_SO
      @SubstationName = @j_SubstationName,
      @SubstationSCADAName = @j_SubstationSCADAName,
      @BuiltBy = @j_BuiltBy,
      @LimitAmount = @j_LimitAmount_i,
      @LimitDesc = @j_LimitDesc,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewConAndDevStats'
  BEGIN
    EXEC dbo.sp_UC000420_ViewConAndDevStats
      @ConsultantID = @j_ConsultantID_i,
      @DeveloperID = @j_DeveloperID_i;
    RETURN;
  END

  IF @action = N'ViewConDetails_SO'
  BEGIN
    IF @j_ConsultantID_i IS NULL THROW 50003, 'ViewConDetails_SO: consultantID is required', 1;
    EXEC dbo.sp_UC000420_ViewConDetails_SO
      @ConsultantID = @j_ConsultantID_i;
    RETURN;
  END

  IF @action = N'ViewConDevelopers'
  BEGIN
    IF @j_ConsultantID_i IS NULL THROW 50003, 'ViewConDevelopers: consultantID is required', 1;
    EXEC dbo.sp_UC000420_ViewConDevelopers
      @ConsultantID = @j_ConsultantID_i,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewConsIssues'
  BEGIN
    IF @j_ConsultantID_i IS NULL THROW 50003, 'ViewConsIssues: consultantID is required', 1;
    EXEC dbo.sp_UC000420_ViewConsIssues
      @ConsultantID = @j_ConsultantID_i,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @ProjectName = @j_ProjectName,
      @CreatedBy = @j_CreatedBy,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewConsProjects'
  BEGIN
    IF @j_ConsultantID_i IS NULL THROW 50003, 'ViewConsProjects: consultantID is required', 1;
    EXEC dbo.sp_UC000420_ViewConsProjects
      @ConsultantID = @j_ConsultantID_i,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewDevConsultants'
  BEGIN
    IF @j_DeveloperID_i IS NULL THROW 50003, 'ViewDevConsultants: developerID is required', 1;
    EXEC dbo.sp_UC000420_ViewDevConsultants
      @DeveloperID = @j_DeveloperID_i,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewDevDetails_SO'
  BEGIN
    IF @j_DeveloperID_i IS NULL THROW 50003, 'ViewDevDetails_SO: developerID is required', 1;
    EXEC dbo.sp_UC000420_ViewDevDetails_SO
      @DeveloperID = @j_DeveloperID_i;
    RETURN;
  END

  IF @action = N'ViewDevIssues'
  BEGIN
    IF @j_DeveloperID_i IS NULL THROW 50003, 'ViewDevIssues: developerID is required', 1;
    EXEC dbo.sp_UC000420_ViewDevIssues
      @DeveloperID = @j_DeveloperID_i,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @ProjectName = @j_ProjectName,
      @ALTERdBy = @j_ALTERdBy,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewDevProjects'
  BEGIN
    IF @j_DeveloperID_i IS NULL THROW 50003, 'ViewDevProjects: developerID is required', 1;
    EXEC dbo.sp_UC000420_ViewDevProjects
      @DeveloperID = @j_DeveloperID_i,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesAreaMap'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewFilesAreaMap: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesAreaMap
      @FileName = @j_FileName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesAreaReport'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewFilesAreaReport: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesAreaReport
      @FileName = @j_FileName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesIssues'
  BEGIN
    IF @j_IssueID_i IS NULL THROW 50003, 'ViewFilesIssues: issueID is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesIssues
      @IssueID = @j_IssueID_i,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesPlot'
  BEGIN
    IF @j_ConsultantID_i IS NULL THROW 50003, 'ViewFilesPlot: consultantID is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesPlot
      @FileName = @j_FileName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DocumentumID = @j_DocumentumID,
      @ConsultantID = @j_ConsultantID_i,
      @ConsultantName = @j_ConsultantName,
      @Day = @j_Day_i,
      @Month = @j_Month_i,
      @Year = @j_Year_i,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesPresentation'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewFilesPresentation: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesPresentation
      @FileName = @j_FileName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesProjectLayout'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewFilesProjectLayout: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesProjectLayout
      @FileName = @j_FileName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesProjHistory'
  BEGIN
    IF @j_PHID_i IS NULL THROW 50003, 'ViewFilesProjHistory: pHID is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesProjHistory
      @PHID = @j_PHID_i,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewFilesZoning'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewFilesZoning: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewFilesZoning
      @FileName = @j_FileName,
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewPlotDetails'
  BEGIN
    IF @j_RowID_i IS NULL THROW 50003, 'ViewPlotDetails: rowID is required', 1;
    EXEC dbo.sp_UC000420_ViewPlotDetails
      @RowID = @j_RowID_i;
    RETURN;
  END

  IF @action = N'ViewPlotSubstations'
  BEGIN
    IF @j_RowID_i IS NULL THROW 50003, 'ViewPlotSubstations: rowID is required', 1;
    EXEC dbo.sp_UC000420_ViewPlotSubstations
      @RowID = @j_RowID_i;
    RETURN;
  END

  IF @action = N'ViewProjDetails'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjDetails: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjDetails
      @MaalemDubaiRef = @j_MaalemDubaiRef;
    RETURN;
  END

  IF @action = N'ViewProjDetails_SO'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjDetails_SO: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjDetails_SO
      @MaalemDubaiRef = @j_MaalemDubaiRef;
    RETURN;
  END

  IF @action = N'ViewProjExistingKVSS'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjExistingKVSS: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjExistingKVSS
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewProjFiles_SO'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjFiles_SO: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjFiles_SO
      @MaalemDubaiRef = @j_MaalemDubaiRef;
    RETURN;
  END

  IF @action = N'ViewProjFutureYears'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjFutureYears: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjFutureYears
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewProjHistory'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjHistory: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjHistory
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @HistoryDate = @j_HistoryDate,
      @PTPLetterReceived = @j_PTPLetterReceived,
      @MPLetterRef = @j_MPLetterRef,
      @PTPReplytoParty = @j_PTPReplytoParty,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewProjIssues'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjIssues: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjIssues
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @Description = @j_Description,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewProjPPR'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjPPR: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjPPR
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @SubstationName = @j_SubstationName,
      @DocumentumID = @j_DocumentumID,
      @Status = @j_Status_b,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewProjRemarks'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjRemarks: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjRemarks
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewProjStats'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjStats: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjStats
      @MaalemDubaiRef = @j_MaalemDubaiRef;
    RETURN;
  END

  IF @action = N'ViewProjSubstations_SO'
  BEGIN
    IF @j_MaalemDubaiRef IS NULL THROW 50003, 'ViewProjSubstations_SO: maalemDubaiRef is required', 1;
    EXEC dbo.sp_UC000420_ViewProjSubstations_SO
      @MaalemDubaiRef = @j_MaalemDubaiRef,
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewSettings_TCL'
  BEGIN
    EXEC dbo.sp_UC000420_ViewSettings_TCL
      @OrderByColumn = @orderBy,
      @SortType = @sort,
      @PageSize = @pageSize,
      @PageNumber = @pageNumber;
    RETURN;
  END

  IF @action = N'ViewSubDetails_SO'
  BEGIN
    IF @j_SubstationId_i IS NULL THROW 50003, 'ViewSubDetails_SO: substationId is required', 1;
    EXEC dbo.sp_UC000420_ViewSubDetails_SO
      @SubstationId = @j_SubstationId_i;
    RETURN;
  END

  IF @action = N'ViewSubstation_Details'
  BEGIN
    IF @j_SubstationId_i IS NULL THROW 50003, 'ViewSubstation_Details: substationId is required', 1;
    EXEC dbo.sp_UC000420_ViewSubstation_Details
      @SubstationId = @j_SubstationId_i;
    RETURN;
  END

  IF @action = N'ViewSubstationLimitDetails'
  BEGIN
    IF @j_SubstationId_i IS NULL THROW 50003, 'ViewSubstationLimitDetails: substationId is required', 1;
    EXEC dbo.sp_UC000420_ViewSubstationLimitDetails
      @SubstationId = @j_SubstationId_i;
    RETURN;
  END

  IF @action = N'ViewSubstation_Limits'
  BEGIN
    IF @j_SubstationId_i IS NULL THROW 50003, 'ViewSubstation_Limits: substationId is required', 1;
    EXEC dbo.sp_UC000420_ViewSubstation_Limits
      @SubstationId = @j_SubstationId_i,
      @Status = @j_Status_i;
    RETURN;
  END

  IF @action = N'ViewSubStats'
  BEGIN
    IF @j_SubId_i IS NULL THROW 50003, 'ViewSubStats: subId is required', 1;
    EXEC dbo.sp_UC000420_ViewSubStats
      @SubId = @j_SubId_i;
    RETURN;
  END

  ;THROW 50099, 'Unknown action', 1;
END
GO
