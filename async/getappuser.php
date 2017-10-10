<?php

    /**
     * Basic_GetAppUser_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Get application user action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.06.25
     */
    class Basic_GetAppUser_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $userId = empty($_SESSION['userId']) ? null : $_SESSION['userId'];
            $user = $userId ? $mySql->getRecordById('users', $userId) : null;
            unset($user['password']);
            $this->data['user'] = $user;
        }
        
    }

?>