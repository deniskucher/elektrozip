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
     * @created 2013.01.01
     * @updated 2016.12.08 Login with username and password
     * @updated 2017.05.25 by Alexander Kudrya: Checking "Active" status
     */
    class Basic_Login_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            // Extract and validate password
            if (!empty($_SESSION['userId'])) throw new AsyncActionException('You should finish current session first.');
            $username = isset($_params['username']) ? $_params['username'] : '';
            $password = isset($_params['password']) ? $_params['password'] : '';
            if (empty($username)) throw new AsyncActionException('Please, enter your username.');
            if (empty($password)) throw new AsyncActionException('Please, enter your password.');

            
            // Login with username and password
            $mySql = Application::getService('basic.mysqlmanager');
            $user = $mySql->getRecord('users', array('login' => $username, 'password' => md5($password)));
            if ($user === false) $user = $mySql->getRecord('users', array('login' => $username.'@oltatravel.ru', 'password' => md5($password)));
            if ($user === false) throw new AsyncActionException('Access denied.');
            //! [2017.05.30] [Alexander Babayev]: Я придираюсь, но зачем здесь '0' взят в кавычки?
            if ($user['active'] == '0') throw new AsyncActionException('Your account has been deactivated.');

            
            // Store user ID in session
            $_SESSION['userId'] = $user['id'];
        }
        
    }

?>