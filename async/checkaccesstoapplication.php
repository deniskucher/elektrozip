<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Check Access To Application
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.13
     */
    //! [2017.05.30] [Alexander Babayev]: Переименовать медот. Над названием еще подумаю...
    class Basic_CheckAccessToApplication_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            // Extract inputs
            $roleId = $this->_getString('roleId', $_params, false, null);
            $appName = $this->_getString('appName', $_params, false, null);
            $head = $this->_getString('head', $_params, false, null);

            $criteria = '`name` = \''.mysql_real_escape_string($appName).'\'';
            $application = $mySql->getRecords('applications', $criteria, '`id`');
            $application = $application[0];

            $response = array('access' => false, 'edit' => false);

            if(is_null($application['accessRoles']))
            {
                $response['access'] = true;
                $response['edit'] = true;
            }
            else
            {
                $roles = explode(',', $application['accessRoles']);
                foreach ($roles as $role)
                {
                    if($role == $roleId){
                        $response['access'] = true;

                        if($application['headOnlyAccess'] == '1' && $head != '1')
                        {
                            $response['access'] = false;
                        }
                        if($application['headOnlyEdit'] == '1' && $head != '1')
                        {
                            $response['edit'] = false;
                        }
                        else
                        {
                            $response['edit'] = true;
                        }
                    };
                }
            }

            // Query access
            $this->data = $response;
        }
    }

?>