<?php

    /**
     * Basic_Login_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Login action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2013.01.01
     */
    class Basic_LoginFromUsersManager_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $userId = isset($_SESSION['userId']) ? $_SESSION['userId'] : null;
            if (!is_null($userId)) throw new AsyncActionException('You should finish current session first.');
            
            // Extract inputs
            $username = $this->_getString('username', $_params, true);
            $password = $this->_getString('password', $_params, true);
            
            
            // Ensure password match
            //if ($password != PASSWORD) throw new AsyncActionException('Access denied.');
            //$user = $mySql->getRecord('users', array('login' => $username, 'password' => new MySqlFunc('MD5', $password)));
            $user = $mySql->getRecord('users', array('login' => $username, 'password' => md5($password), 'active' => 'YES'));
            if (!$user) throw new AsyncActionException('ДОСТУП ЗАКРЫТ!!!');
            
            
            // Store user ID in session
            $_SESSION['userId'] = $user['id'];
        }
        
    }

?>