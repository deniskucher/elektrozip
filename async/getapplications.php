<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Get applications
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.12
     */
    class Basic_GetApplications_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        //! [2017.05.30] [Alexander Babayev]: Порефакторить...
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            // Extract inputs
            $userRole = $this->_getString('userRole', $_params, false, null);

            $allApplications = $mySql->getRecords('applications', '1', '`id`');

            $tempArray = array();

            foreach ($allApplications as $application)
            {
                if(is_null($application['accessRoles']))
                {
                    array_push($tempArray, $application);
                }
                else
                {
                    $roles = explode(',', $application['accessRoles']);
                    foreach ($roles as $role)
                    {
                        if($role == $userRole) array_push($tempArray, $application);
                    }
                }
            }

            $allModules = $mySql->getRecords('modules', '1', '`id`');

            $response = array();

            foreach ($tempArray as $responseApplication)
            {
                $moduleId = $responseApplication['moduleId'];
                foreach ($allModules as $module)
                {
                    if($module['id'] == $moduleId)
                    {
                        $responseApplication['module'] = $module['name'];
                        array_push($response, $responseApplication);
                    }
                }
            }

            // Query applications
            $this->data['applications'] = $response;
        }
    }

?>