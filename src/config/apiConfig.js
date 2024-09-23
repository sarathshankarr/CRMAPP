
export const CUSTOMER_URL =
  'https://crm.codeverse.co/cedge/get-customer-url/crm/';

export const API = {
  LOGIN: 'erpportal/oauth/token',
  LOCATION: 'erpportal/api/style/cedge/getLocationInventory',
  ALL_PRODUCTS_DATA: 'erpportal/api/style/findallstyles',
  ALL_CATEGORIES_DATA: 'erpportal/api/category/getcategoriesByCompanyId',
  STYLE_QUNTITY_DATA: 'erpportal/api/style',
  ADD_ORDER_DATA: 'erpportal/api/ordermgmt/adddistributororder',
  ADD_CUSTOMER_LIST: 'erpportal/api/customers',
  GET_ALL_ORDER: 'erpportal/api/ordermgmt/findAllDisOrders',
  GET_CUSTOMER_LOCATION: 'erpportal/api/location/getLocationsAccCustomer',
  ADD_CUSTOMER_DETAILS: 'erpportal/api/customers/addcustomer',
  ADD_DISTRIBUTOR_DETAILS: 'erpportal/api/distributors/addDistributor',
  ADD_CUSTOMER_LOCATION: 'erpportal/api/location/addlocation',
  ADD_USERS: 'erpportal/api/users',
  ADD_PRODUCT_INVENTORY: 'erpportal/api/style/cedge/getMainInventory',
  ADD_LOCATION_INVENTORY: 'erpportal/api/style/cedge/getLocationInventory',
  GET_ORDER_PACKING: 'erpportal/api/ordermgmt/getOrderPacking',
  ADD_GENERATED_PDF:  'erpportal/api/ordermgmt/generatePdf',
  GET_DISTRIBUTOR_GRN:'erpportal/api/ordermgmt/findAllGrnOrders',
  GET_DISTRIBUTOR_ORDER: 'erpportal/api/ordermgmt/disOrdersById',
  ADD_GRN_ORDER: 'erpportal/api/ordermgmt/addgrnorder',
  GET_COMPANY:'erpportal/api/company',
  GET_ALL_TASK:'erpportal/api/master/getAllTasksByDesc',
  GET_ALL_CALL:'erpportal/api/master/getAllCallsByDesc',
  ADD_NEW_TASK:'erpportal/api/master/addTask',
  GET_TASK_BY_ID:'erpportal/api/master/getTask',
  ADD_NEW_CALL:'erpportal/api/master/addCall',
  GET_CALL_BY_ID:'erpportal/api/master/getCall',
  ADD_UPDATE_TASK:'erpportal/api/master/addTask',
  GET_DISTRIBUTORS_DETAILS:'erpportal/api/distributors',
  GET_USER_IN_ACTIVE:'erpportal/api/users/updateUserInActive',
  GENERATE_CATE_LOG:'erpportal/api/ordermgmt/generateCatelog',
  VALIDATIONDISTRIBUTOR:"erpportal/api/distributors/isValiddistributor",
  VALIDATIONCUSTOMER:"erpportal/api/customers/isValidCustomer",
  VALIDATIONLOACTION:"erpportal/api/location/isValid",
  ALL_PRODUCTS_DATA_NEW: 'erpportal/api/style/getAll',
  GET_TASKS_ACC_USER:'erpportal/api/master/getTasksAccUser',
  GET_Fields_List:'erpportal/api/master/getField',
  GET_CATEGORY_LIST:'erpportal/api/category/getcategoriesByCompanyId/',
  GET_COLOR_LIST:'erpportal/api/color/getByCompanyId/',
  GET_CUSTOMERLEVEL_LIST:'erpportal/api/customerlevel/types',
  GET_TYPES_LIST:'erpportal/api/type/getByCompanyId/',
  GET_SEASONGROUP_LIST:'erpportal/api/sizegroup/getBycompanyId/',
  GET_PROCESSWORKFLOW_LIST:'erpportal/api/master/getAllProcessConfig',
  GET_LOCATION_C0_LIST:'erpportal/api/style/cedge/getCompanyLocations',
  GET_LOCATION_C1_LIST:'erpportal/api/location/withNames/',
  GET_SCALES:'erpportal/api/scale/',
  VALIDATE_CATEGORY:'erpportal/api/category/isValidCategory/',
  ADD_CATEGORY:'erpportal/api/category/addcategory',
  VALIDATE_COLOR:'erpportal/api/color/isValid/',
  ADD_COLOR:'erpportal/api/color/addcolor',
  VALIDATE_TYPE:'erpportal/api/type/isValid/',
  ADD_TYPE:'erpportal/api/type/addtype',
  VALIDATE_SEASON_GROUP:'erpportal/api/sizegroup/isValid/',
  ADD_SEASON_GROUP:'erpportal/api/sizegroup/addsize',
  VALIDATE_SCALE:'erpportal/api/size/isValid/',
  ADD_SCALE:'erpportal/api/size/addsizes',
  ALL_SIZES_IN_SCALE:'erpportal/api/size/getByCompanyId',
  GET_STYLE_BY_ID:'erpportal/api/style/',
  GET_STYLE_LIST:'erpportal/api/style/getAll/',
  ADD_NEW_SCALE:'erpportal/api/scale/addScale',

  ADD_NEW_STYLE:'erpportal/api/style/addstyle',
  EDIT_NEW_STYLE:'erpportal/api/style/editstyle',
  LOGINAUDIT:'erpportal/api/master/addLoginoutAudit',
  GET_ALL_STATUS:'erpportal/api/ordermgmt/getAllStatus',
  UPDATE_DIS_ORDERl:'erpportal/api/ordermgmt/updateDisOrder',
  ADD_LOCATION_IMAGES:'erpportal/api/master/addLocation',
  GET_Location:'erpportal/api/master/getLocation',
  GET_NOTIFICATION_LIST:'erpportal/api/master/getMessages',
  UPDATE_READ_MSG:'erpportal/api/master/updateRead',
  GET_KAPTURE:'erpportal/api/master/getAllMasters',
  VALIDATE_KAPTURE:'erpportal/api/master/isValidClosures',
  ADD_KAPTURE:'erpportal/api/master/saveMaster',
  GET_DISTRIBUTOR_INVENTORY:'erpportal/api/ordermgmt/getAllDisInventoryLazy',
  GET_DISTRIBUTOR_INVENTORY_SEARCH:'erpportal/api/filter/getdisInventoryLazyLoad',
  GET_CLEARALL_MESSAGE:'erpportal/api/master/clearAllNotifications',
  ADD_ALL_INVENTORY_LAZY:'erpportal/api/style/cedge/getAllInventoryLazy',
  GET_ALL_INVENTORY_SEARCH:'erpportal/api/filter/getStyleInventoryForsearchLazyLoad',
  ADD_LOCATION_INVENTORY_LAZY:'erpportal/api/style/cedge/getLocationInventory',
  GET_ALL_LOCATION_INVENTORY_SEARCH:'erpportal/api/filter/getLocationInventoryForsearchLazyLoad',
  GET_ALL_ORDER_LAZY: 'erpportal/api/ordermgmt/getAllOrdersForLazyLoad',
  GET_ALL_ORDER_SEARCH:'erpportal/api/filter/getAllOrdersSearchForLazyLoad',
  GET_ALL_STYLE_LAZY:'erpportal/api/style/getAllStyleLazy',
  GET_ALL_STYLE_LAZY_SEARCH:'erpportal/api/filter/getStyleProductDataForLazyLoad',
  PUNCH_IN_PUNCH_OUT:'erpportal/api/master/updateAttendanceSwape',
  GET_PUNCH_IN_PUNCH_OUT:'erpportal/api/master/getAttendanceSwapes',
  CHECK_IN_CHECK_OUT:'erpportal/api/master/updateTaskPunchInOut',
  GET_PACKAGES:'erpportal/api/package/getMobPackegeLazy',
  GET_PACKAGES_SERACH:'erpportal/api/filter/getPackegeDataForMobLazyLoad',
  GET_ALL_PACKAGES_DETAILS:'erpportal/api/package/getPackageMobile',
  GET_PACKAGES_MODEL:'erpportal/api/package',
  GET_ALL_TASK_LAZY:'erpportal/api/master/getAllTasksFromTo',
  GET_ALL_CALL_LAZY:'erpportal/api/master/getAllCallsFromTo',
  GET_ALL_TASK__SEARCH:'erpportal/api/master/getTasksSearchFromTo',
  GET_ALL_CALL_SEARCH:'erpportal/api/master/getCallsSearchFromTo',
  SEARCH_DISTRIBUTOR_GRN:'erpportal/api/filter/getDistributorGRNBasedOnTypeServices',
  SEARCH_ALL_PRODUCTS:'erpportal/api/style/searchAllStylesMobile',
  SEARCH_ALL_CATEGORIES_LL:'erpportal/api/filter/getCategoryBasedOnTypeServicesMob',
  ALL_CATEGORIES_LL_LIST: 'erpportal/api/category/getAllCategoryLazyLoadForMob',
  GET_DISTRIBUTOR_GRN_LL:'erpportal/api/ordermgmt/getAllDistributorGRNLazyLoad',

};

export const USER_ID = 'adminClientId';
export const USER_PASSWORD = 'erpPortalAdmin';




