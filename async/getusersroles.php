<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetUsersRoles_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			$userRoles = $mySql->getRecords('userRoles');
			$this->data['usersRoles'] = $userRoles;
		}
    }
        

?>