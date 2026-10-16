SELECT TOP (1000) [ConsultantID]

      ,[ConsultantName]

      ,[ConsultantURL]

      ,[ConsultantImage]

      ,[IsActive]

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

      ,[FileId]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Consultants]

 
SELECT TOP (1000) [DeveloperID]

      ,[DeveloperName]

      ,[DeveloperURL]

      ,[IsActive]

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

      ,[FileId]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Developers]

 
SELECT TOP (1000) [Ref]

      ,[MaalemDubaiRef]

      ,[ProjectName]

      ,[Engineer]

      ,[AsstEng]

      ,[MasterPlanStatus]

      ,[Corridors11kV]

      ,[Ducts11kV]

      ,[HVNOC]

      ,[SiteSurveyor]

      ,[AreaMap]

      ,[AreaMapRef]

      ,[AreaReport]

      ,[DeveloperID]

      ,[TCLMW]

      ,[DCPMW]

      ,[SS400kV]

      ,[SS132kV]

      ,[Zone]

      ,[SubZone]

      ,[BuiltPerc]

      ,[UCPerc]

      ,[VPerc]

      ,[SS132kVExisting]

      ,[ProjectCategory]

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

      ,[MaalemDubaiNo]

      ,[Remarks]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_MasterProjectTable]

 
SELECT TOP (1000) [RowID]

      ,[MaalemDubaiRef]

      ,[ConsultantID]

      ,[DevPlotNum]

      ,[DMPlotNum]

      ,[PlotOwnerName]

      ,[PlotProjectName]

      ,[PowerDensity]

      ,[GFA]

      ,[LandUse]

      ,[PlotStatus]

      ,[ExpPowerReq]

      ,[GenaralLoad]

      ,[LocalizedCoolingLoad]

      ,[DCP]

      ,[TotalConnectedLoad]

      ,[InitSubID]

      ,[InitDevSubCommDate]

      ,[UltSubID]

      ,[UltDevSubCommDate]

      ,[NOCRelease]

      ,[FileID]

      ,[created_at]

      ,[created_by]

      ,[updated_at]

      ,[updated_by]

      ,[IsActive]

      ,[ObjectKey]

      ,[RobotName]

      ,[ExecutionId]

      ,[FirstExtracted]

      ,[LastExtracted]

      ,[ExtractedInLastRun]

      ,[LastUpdated]

      ,[EVChargerLoad]

      ,[DataCenterLoad]

      ,[SolarLoad]

      ,[IndustrialLoad]

      ,[LightingLoad]

      ,[AgritechLoad]

      ,[OtherLoads]

      ,[GISUrl]

      ,[OrigDMPlotNum]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Plots]

 
SELECT TOP (1000) [SubstationID]

      ,[SubstationName]

      ,[IsActive]

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

      ,[SubstationSCADAName]

      ,[BuiltBy]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substations]

 
SELECT TOP (1000) [ConIssueId]

      ,[ConsultantID]

      ,[Description]

      ,[MaalemDubaiRef]

      ,[created_at]

      ,[created_by]

      ,[ObjectKey]

      ,[RobotName]

      ,[ExecutionId]

      ,[FirstExtracted]

      ,[LastExtracted]

      ,[ExtractedInLastRun]

      ,[LastUpdated]

      ,[updated_at]

      ,[updated_by]

      ,[IsActive]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ConsultantIssues]

 
SELECT TOP (1000) [DevIssueId]

      ,[DeveloperID]

      ,[Description]

      ,[MaalemDubaiRef]

      ,[created_at]

      ,[created_by]

      ,[ObjectKey]

      ,[RobotName]

      ,[ExecutionId]

      ,[FirstExtracted]

      ,[LastExtracted]

      ,[ExtractedInLastRun]

      ,[LastUpdated]

      ,[updated_at]

      ,[updated_by]

      ,[IsActive]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_DeveloperIssues]

 
SELECT TOP (1000) [RowId]

      ,[MaalemDubaiRef]

      ,[SubstationID]

      ,[Status]

      ,[created_at]

      ,[created_by]

      ,[updated_at]

      ,[updated_by]

      ,[IsActive]

      ,[ObjectKey]

      ,[RobotName]

      ,[ExecutionId]

      ,[FirstExtracted]

      ,[LastExtracted]

      ,[ExtractedInLastRun]

      ,[LastUpdated]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ExistingKVSS]

 
SELECT TOP (1000) [RowID]

      ,[MaalemDubaiRef]

      ,[Description]

      ,[created_by]

      ,[created_at]

      ,[updated_by]

      ,[updated_at]

      ,[IsActive]

      ,[ObjectKey]

      ,[RobotName]

      ,[ExecutionId]

      ,[FirstExtracted]

      ,[LastExtracted]

      ,[ExtractedInLastRun]

      ,[LastUpdated]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Issues]

 
SELECT TOP (1000) [RowID]

      ,[IssueID]

      ,[FileID]

      ,[IsActive]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_IssuesFileLink]

 
SELECT TOP (1000) [LimitID]

      ,[LimitAmount]

      ,[LimitDesc]

      ,[created_at]

      ,[created_by]

      ,[updated_at]

      ,[updated_by]

      ,[IsActive]

      ,[LimitAmntDesc]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_LookUp_Substation_Limits_TCL]

 
SELECT TOP (1000) [RowID]

      ,[MaalemDubaiRef]

      ,[SubstationID]

      ,[created_by]

      ,[created_at]

      ,[updated_by]

      ,[updated_at]

      ,[IsActive]

      ,[ObjectKey]

      ,[RobotName]

      ,[ExecutionId]

      ,[FirstExtracted]

      ,[LastExtracted]

      ,[ExtractedInLastRun]

      ,[LastUpdated]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPR]

 
SELECT TOP (1000) [RowID]

      ,[PPRID]

      ,[FileID]

      ,[IsActive]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_PPRFileLink]

 
SELECT TOP (1000) [RowID]

      ,[MaalemDubaiRef]

      ,[ConsultantID]

      ,[created_at]

      ,[created_by]

      ,[updated_at]

      ,[updated_by]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Project_Consultant_Link]

 
SELECT TOP (1000) [RowID]

      ,[HistoryDate]

      ,[MaalemDubaiRef]

      ,[PTPLetterReceived]

      ,[MPLetterRef]

      ,[IsActive]

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

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistory]

 
SELECT TOP (1000) [RowID]

      ,[ProjectHistID]

      ,[FileID]

      ,[IsActive]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectHistoryFileLink]

 
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

 
SELECT TOP (1000) [RowId]

      ,[MaalemDubaiRef]

      ,[Remarks]

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

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_ProjectsRemarks]

 
SELECT TOP (1000) [RowID]

      ,[SubstationID]

      ,[LimitID]

      ,[created_at]

      ,[created_by]

      ,[updated_at]

      ,[updated_by]

      ,[IsActive]

  FROM [Microsoft_PP_Projects_Dev].[dbo].[UC000420_Substation_Limits_TCL]

 