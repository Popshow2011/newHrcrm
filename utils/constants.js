// modules
export const MODULE = {
  VACANCY_MODULE: 'HRPAC_VACANCY',
  VACANCY_TEMPLATE_MODULE: 'HRPAC_VACANCY_TEMPLATE',
  CANDIDATES_MODULE: 'HRPAC_CANDIDATES',
  PANEL_SELECTION: 'panel_Selection',
  REJECTION_REASONS: 'HRPAC_REJECTION_REASONS',
  REJECTION_CATEGORIES: 'HRPAC_REJECTION_CATEGORIES',
  EMAILS: 'Emails',
  DOCUMENTS: 'Documents',
  HRPAC_TAGS: 'HRPAC_TAGS',
  HRPAC_COMMENTS: 'HRPAC_COMMENTS',
  IR_QUESTIONS: 'IR_QUESTIONS',
  IR_INTERVIEW_REPORT: 'IR_INTERVIEW_REPORT',
  EMPLOYEES: 'Employees',
  HRPAC_VACANCY_HRPAC_CANDIDATES_1: 'hrpac_vacancy_hrpac_candidates_1',
  AUDIT: 'Audit',
  HRPAC_NEW_EPLOYEE_EXIT: 'HRPAC_NEW_EPLOYEE_EXIT',
  HRPAC_OFFERS: 'HRPAC_OFFERS',
  HRPAC_TELEGRAM_MESSAGES: 'HRPAC_TELEGRAM_MESSAGES',
  HRPAC_PUBLISHED_VACANCY: 'HRPAC_PUBLISHED_VACANCY',
  CANDIDATE_RESPONDS: 'HRPAC_CANDIDATE_RESPONDS',
  BOT_MAILINGS: 'BOT_MAILINGS',
  BOT_AUDITORY: 'BOT_AUDITORY',
  BOT_COMMUNICATION: 'BOT_COMMUNICATION',
  AOS_PDF_Templates: 'AOS_PDF_Templates',
  BOT_SCRIPT: 'BOT_SCRIPT',
  BOT_ANSWER: 'BOT_ANSWER',
  BOT_MESSAGES: 'BOT_MESSAGES',
  BOT_IMAGES: 'BOT_IMAGES',
  BOT_STAGES_OF_SCRIPT: 'BOT_STAGES_OF_SCRIPT',
  HRPAC_CUSTOM_IMPORT: 'HRPAC_CUSTOM_IMPORT',
  HRPAC_MANNING_TABLE: 'HRPAC_MANNING_TABLE',
  HRPAC_EVENT: 'HRPAC_EVENT',
  HRPAC_REMINDER: 'HRPAC_REMINDER',
  HRPAC_COORDINATION_SCENARIOS: 'HRPAC_COORDINATION_SCENARIOS',
  HRPAC_COORDINATION_REQUESTS: 'HRPAC_COORDINATION_REQUESTS',
  HRPAC_COORDINATION_PLANS: 'HRPAC_COORDINATION_PLANS',
  AOR_REPORTS: 'AOR_Reports',
  LKK_CANDIDATE_QUESTIONNAIRE: 'LKK_CANDIDATE_QUESTIONNAIRE',
  HRPAC_CALENDAR: 'HRPAC_CALENDAR',
  HRPAC_SEARCH_COLUMNS: 'HRPAC_SEARCH_COLUMNS',
  NOTES: 'Notes',
  HRPAC_SELECTION_STAGE: 'HRPAC_SELECTION_STAGE'
};

// actions
export const ACTION = {
  EDIT_VIEW: 'EditView',
  DETAIL_VIEW: 'DetailView',
  POPUP: 'Popup',
  JSON_LIST: 'json_list',
  SAVE: 'Save',
  SAVE2: 'save2',
  DELETE: 'Delete',
  GET_LINK: 'getLink',
  GET_IR_FIELDS_DATA: 'getIRFieldsData',
  SAVE_IR_DATA: 'saveIRData',
  SUBPANEL_VIEWER: 'SubPanelViewer',
  SUBPANEL_JSON_DATA: 'subpanel_json_data',
  GET_CANDIDATE_TAGS: 'getCandidatesTags',
  ADD_TAG_TO_CANDIDATE: 'addTagToCandidate',
  CREATE_TAG: 'createTag',
  REMOVE_TAG_FROM_CANDIDATE: 'removeTagFromCandidate',
  GET_SUBPANEL_JSON_DATA: 'get_subpanel_json_data',
  GET_FIELDS_MODULE_CHECK_ACL: 'getFieldsForModuleAndCheckACL',
  DELETE_RELATIONSHIP: 'DeleteRelationship',
  GET_VACANCIES_LIST: 'takeVacanciesList',
  GET_MODULE_FIELDS: 'getFieldsForModule',
  GET_EDITVIEW: 'get_EditView',
  GET_DETAILVIEW: 'get_DetailView',
  SEND: 'send',
  SAVE_PUBLISHED_VACANCY: 'savePublishedVacancy',
  SEARCH_PUBLISHED_VACANCY: 'searchPublishedVacancy',
  PROLONGATE_VACANCY: 'prolongateVacancy',
  DELETE_PUBLISHED_VACANCY: 'deletePublishedVacancy',
  RESTORE_PUBLISHED_VACANCY: 'restorePublishedVacancy',
  ARCHIVE_PUBLISHED_VACANCY: 'archivePublishedVacancy',
  COPY_PUBLISHED_VACANCY: 'copyPublishedVacancy',
  RESPONDS_CANDIDATE_COUNT: 'getRespondsStageCount',
  GET_AUDITORY_LIST: 'getCandidatesFromAuditory',
  GET_TEMPLATE_BY_TYPE: 'getTemplateByType',
  UPLOAD: 'upload',
  RUN: 'run_import',
  STATUS: 'status',
  FINISH: 'finish',
  CANCEL: 'cancel',
  SAVE_SCENARIO: 'saveCoordinationScenario',
  SAVE_PLAN: 'saveCoordinationPlan',
  FINISH_SINGLE: 'finish',
  CANCEL_SINGLE: 'cancel',
  CANCEL_MULTI: 'cancel_file_upload',
  FINISH_MULTI: 'completion',
  GET_POPUP_VIEW: 'get_popup_view',
  SAVE_SEARCH_FIELDS: 'saveSearchFields',
  GET_CANDIDATES_STAGE_WITH_MASS_ACTIONS: 'getCandidatesStageWithMassActions',
  GET_STAGES_FOR_MASS_TRANSFER: 'getStagesForMassTransfer',
  MASS_CHANGE_STAGE: 'mass_selection_stage_ajax',
  SAVE_CALENDAR_STATE: 'saveCalendarDisplaySettings'
};

// subpanels
export const SUBPANEL = {
  ID: {
    RESUME: 'resume',
    AUDIT: 'audit',
    INTERVIEW_REPORT: 'interview_report',
    DOCUMENTS: 'documents',
    COMMUNICATIONS: 'communications',
    COMMENTS: 'comments',
    DESCRIPTION: 'description',
    EMAILS: 'hrpac_candidates_emails',
    PROJECT: 'project',
    SELECTION: 'selection',
    PUBLICATOR: 'publicator',
    CONTACTS: 'contacts',
    JOB_EXPERIENCE: 'job_experience',
    MESSAGE: 'messages',
    PLAN: 'plan'
  }
};

// sort params
export const SORT_PARAMS = {
  CANDIDATES_EMAILS_CELL_ORDER_BY:
    'HRPAC_CANDIDATES_hrpac_candidates_emails_CELL_ORDER_BY',
  CANDIDATES_EMAILS_CELL_OFFSET:
    'HRPAC_CANDIDATES_hrpac_candidates_emails_CELL_offset',
  SORT_ORDER: 'sort_order'
};

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
};

// configs
export const DEFAULT_FORM_SIZE = 'mini';
export const SCROLL_VALUE = 90;
export const CITIES = {
  SPB_CITY: 'Санкт-Петербург',
  MSK_CITY: 'Москва'
};

// field params, types, ids
export const FIELD = {
  ID: {
    NAME: 'name',
    STACK_SKILLS_IDS: 'stack_skills_ids',
    DESIRABLE_STACK_SKILLS: 'desirable_skills_ids',
    GRADE: 'grade',
    GRADE_ADVANCED: 'grade_advanced',
    SALARY: 'salary',
    SALARY_MIN: 'salary_min',
    SALARY_MAX: 'salary_max',
    CURRENCY_ID: 'currency_id',
    HRPAC_VACANCY_TEMPLATE_ID: 'hrpac_vacancy_template_id',
    HRPAC_VACANCY_TEMPLATE_NAME: 'hrpac_vacancy_template_name',
    DEMANDS: 'demands',
    DESCRIPTION: 'description',
    LOCATION_ID: 'location_id',
    SKILL_ID: 'skill_id',
    SKILLS_IDS: 'skills_ids',
    SKILL_NAME: 'skill_name',
    ANSWER_TYPE: 'answer_type',
    QUESTION_TYPE: 'question_type',
    IR_ANSWER_OPTIONS: 'ir_answer_options',
    SORT_IN_TYPE: 'sort_in_type',
    JOB_EXPERIENCE_GROUP: 'job_experience_group',
    DATE_ENTERED: 'date_entered',
    DATE_ENTERED_ADVANCED: 'date_entered_advanced',
    DATE_MODIFIED: 'date_modified',
    DATE_STATUS_MODIFIED_ADVANCED: 'date_status_modified_advanced',
    COMMUNICATIONS: 'communications',
    DETAIL_EXPERIENCE: 'detail_experience',
    PHOTO: 'photo',
    CANDIDATES_JOBS: 'candidates_jobs',
    EXPERIENCE: 'experience',
    LAST_WORK: 'last_work',
    LAST_POST: 'last_post',
    CREATED_BY_NAME: 'created_by_name',
    RESUME_SOURCE_ID: 'resume_source_id',
    RESUME_DATE_UPD: 'resume_date_upd',
    RESUME_URL: 'resume_url',
    RESUME_TEXT: 'resume_text',
    LAST_COMMENTS: 'last_comments',
    SPECIALTY: 'specialty',
    AGE: 'age',
    NAME_ID: 'name_id',
    NAME_ID_C: 'hrpac_vacancy_names_id_c',
    BUSINESS_UNIT: 'business_unit_id',
    STACK_SKILLS: 'stack_skills_ids',
    PROJECT_LINK: 'project_link_id',
    MANAGER_ID: 'manager_id',
    DEPARTMENT_ID: 'department_id',
    ASSIGNED_USER_NAME: 'assigned_user_name',
    CUSTOMER_GROUP: 'customer_group',
    HRPAC_VACANCY_DIFFICULTY_LEVEL: 'hrpac_vacancy_difficulty_level_name',
    VACANCY_URL: 'vacansy_url',
    AMOUNT_FINAL: 'amount_final',
    REASON_FOR_OPENING: 'reason_for_opening',
    REASON_FOR_OPENING_ID: 'reason_for_opening_id',
    STATUS_ID: 'status_id',
    PROGRESSBAR: 'progresbar',
    OFFICE_JOB: 'office_job',
    REMOTE_JOB: 'remote_job',
    SUPERVISOR_ID: 'supervisor_id',
    ADDITIONAL_MANAGERS: 'additional_managers_ids',
    TECHNICAL_EXPERTS: 'technical_experts_ids',
    SPECTATORS: 'spectators_ids',
    ADDITIONAL_ASSIGNED: 'additional_assigned_ids',
    EXTERNAL_CUSTOMER: 'external_customer_contact',
    RECOGNITION_RESUME_ID: 'recognition_resume_id',
    DIRECTION_SECTION: 'direction_section',
    REJECTION_CATEGORIES: 'rejection_categories',
    REJECTION_REASONS: 'rejection_reasons',
    REASON_FOR_RETURN: 'reason_for_return',
    BIRTH_DATE: 'birth_date',
    PHONE: 'phone',
    PHONE_NUMBER: 'phone_number',
    DATE_END_CONTRACT: 'date_end_contract',
    SALARY_GROUP: 'salary_group',
    LANGUAGE_LEVEL: 'language_level',
    CONTACTS_PHONES: 'contacts_phones',
    CONTACTS_EMAIL: 'contacts_email',
    SALARY_FROM: 'salary_from',
    SALARY_TO: 'salary_to',
    EMAILS_EMAIL_TEMPLATES_NAME: 'emails_email_templates_name',
    SPECIALIZATIONS: 'specializations',
    SUBDIVISION_NAME: 'hrpac_subdivision_name',
    SUBDIVISION_ID: 'hrpac_subdivision_id',
    MANNING_TABLE_NAME: 'manning_table_name',
    LINE_MANAGER_NAME: 'line_manager_name',
    LINE_MANAGER_ID: 'line_manager_id',
    VACANCY_NAME: 'vacancy_name',
    EDUCATION: 'education',
    LANGUAGE: 'language_proficiency',
    QUALIFICATION: 'skills_training'
  },
  TYPE: {
    ID: 'id',
    LINK: 'link',
    GROUP: 'group',
    DECIMAL: 'decimal',
    ENUM: 'enum',
    MULTIENUM: 'multienum',
    FILE: 'file',
    TEXT: 'text',
    TXT: 'txt',
    NAME: 'name',
    RELATE: 'relate',
    RELLINK: 'rellink',
    CURRENCY_ID: 'currency_id',
    CURRENCY: 'currency',
    BOOL: 'bool',
    INT: 'int',
    VARCHAR: 'varchar',
    DATE: 'date',
    DATETIME: 'datetime',
    DATETIMECOMBO: 'datetimecombo',
    COMMUNICATION: 'MeansCommunication',
    DETAIL_EXPERIENCE: 'DetailExperience',
    LANGUAGE_LEVEL: 'MeansLanguage',
    IMAGE: 'image',
    WYSIWYG: 'wysiwyg',
    URL: 'url',
    HRPAC_CANDIDATES_JOBS: 'HRPAC_CANDIDATES_JOBS',
    RADIOBUTTON: 'radiobutton',
    MULTIARRAY: 'multiArray',
    EMAILBODY: 'emailbody',
    EDUCATION: 'Education',
    LANGUAGE: 'LanguageProficiency',
    QUALIFICATION: 'SkillsTraining',
    HTML_LABEL: 'html_label'
  },
  PARAM: {
    FRONT_FIELD_TYPE: 'front_field_type',
    VISIBILITY: 'visibility',
    HIDDEN: 'hidden',
    DISABLED: 'disabled',
    MULTIPLE_LIMIT: 'multiple-limit',
    SORT_IN_TYPE: 'sort_in_type',
    VISUAL_TYPE: 'visual_type'
  },
  VISUAL_TYPE: {
    SUB_RADIO: 'sub_radio',
    SUB_CHECKBOX: 'sub_checkbox',
    TIMEPICKER: 'timepicker',
    ENUM: 'enum_advanced'
  }
};

// button params, types, ids
export const BUTTON = {
  ID: {
    OK: 'ok',
    SAVE: 'save',
    SAVE_MEETING: 'save_meeting',
    CANCEL: 'cancel',
    APPLY_FOR: 'apply_for',
    SHARE_BY_CANDIDATE: 'share_candidate_in_telegram',
    SET_MEETING: 'set_meeting',
    ACTIONS: 'actions',
    EDIT: 'edit',
    DELETE: 'delete',
    GENERATE_LINK: 'generate_link',
    SEND_MAIL: 'send_mail',
    PICK_CANDIDATE: 'pick_candidate',
    OPEN_POSITIONS: 'open_positions',
    CANCEL_POSITIONS: 'cancel_positions',
    VACANCY_TEMPLATE_POPUP: 'vacansy_template_popup',
    FORM_OFFER: 'form_offer',
    SEND_PD: 'send_pd',
    // SEND_QUESTIONNAIRE: 'send_questionnaire',
    ADD_TAG: 'add_tag',
    OPEN_QUESTIONNAIRE: 'open_questionnaire',
    FORM_EXIT_REQUEST: 'form_exit_request',
    PREVIEW: 'preview',
    SAVE_AND_DOWNLOAD: 'save_and_download',
    PUBLISH: 'publish',
    SAVE_PUBLICATOR: 'save_publicator',
    SAVE_AS_TEMPLATE: 'save_as_template',
    SAVE_AS_TEMPLATE_NOT_PUBLISH: 'save_as_template_not_publish',
    SEND_EMAIL: 'send_email',
    SAVE_RESUME: 'save_resume',
    ACCEPT_EVENT: 'accept_event',
    CANCEL_EVENT: 'cancel_event',
    CANCEL_EVENT_CREATED_BY: 'cancel_event_created_by',
    TUNE: 'tune'
  },
  TYPE: {
    LINK: 'link',
    POPUP: 'popup',
    AJAX: 'ajax',
    PARENT: 'parent',
    DROPDOWN: 'dropdown'
  },
  PARAM: {
    DISABLED: 'disabled',
    HIDDEN: 'hidden'
  }
};

export const ANSWER_TYPE = {
  TEXT_ANSWER: 'text_answer',
  LINE_ANSWER: 'line_answer',
  DATE_ANSWER: 'date_answer',
  DATETIME_ANSWER: 'datetime_answer',
  RATING_ANSWER: 'rating_answer',
  SCALE_ANSWER: 'scale_answer',
  OPTION_ANSWER: 'option_answer',
  DROPDOWN_ANSWER: 'dropdown_answer',
  MULTIENUM_ANSWER: 'multienum_answer',
  BOOL_ANSWER: 'bool_answer'
};

export const QUESTION_TYPE = {
  SKILLS_ASSESSMENT: 'skills_assessment',
  GENERAL: 'general',
  MOTIVATION: 'motivation',
  JOB_EXPERIENCE: 'job_experience',
  INTERVIEW_RESULTS: 'interview_results'
};

// file types
export const UPLOAD_ACCEPT_TYPE = {
  IMAGE: 'image/png, image/jpeg, image/jpg',
  IMAGE_ALL: 'image/*',
  AUDIO_ALL: 'audio/*',
  VIDEO_ALL: 'video/*'
};

// рассылка для этапов по выходу сотрудника
export const STAGE_TYPE_FOR_EXIT_EMPLOYEE = {
  PREPARE_TO_EXIT: 'prepare_to_exit',
  OFFER: 'offer'
};

// communication types
export const CONTACT = {
  TYPE: {
    PHONE: 'phone',
    EMAIL: 'email',
    TELEGRAM: 'telegram',
    SKYPE: 'skype',
    FACEBOOK: 'facebook',
    FREELANCE: 'freelance',
    SITE: 'site',
    LINKEDIN: 'linkedin',
    LIVEJOURNAL: 'livejournal',
    C_HABR: 'moi_krug',
    ICQ: 'icq'
  }
};

export const OFFER_STAGE = 'da56c3d2-4b84-d4f6-9a52-5dca56f7b688';
export const PREPARE_TO_EXIT_STAGE = 'd9d3cffc-8ec0-9ba4-74a9-5dca56460314';
export const PUBLICATOR_STATUS = {
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  DRAFT: 'draft',
  PUBLISHED: 'published'
};
