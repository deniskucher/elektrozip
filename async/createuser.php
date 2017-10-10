<?php

    /**
     * Basic_CreateUser_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    //! [2017.05.30] [Alexander Babayev]: Если метод дорабатыается, то мы не меняем дату создания и автора, а пишем @updated YYYY-MM-DD by Name Surname <email>: Details...
    /**
     * Create user action
 *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @created 2014.11.12
 */
    class Basic_CreateUser_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        //! [2017.05.30] [Alexander Babayev]: Не лучший вариант... И очнь много подобных кусков кода. Надо порефакторить.
        private $roles = array(
            1 => 'Administrator',
            2 => 'Tour Operator',
            3 => 'Sales Manager',
            4 => 'Operating Officer',
        );


        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            // Extract inputs
            $data = $this->_getArray('data', $_params, true);
            $name = $this->_getString('name', $data, true);
            $username = $this->_getString('username', $data, true);
            $password = $this->_getString('password', $data, true);
            $role = $this->_getString('role', $data, true);

            $password = md5($password);

            // Check username uniqueness
            $checkUser = $mySql->count('users', array('login' => $username));
            if ($checkUser != 0) throw new AsyncActionException('Login already exists.');

            // Insert User record
            $date = date('Y-m-d H:i:s');
            $user = array('name' => $name, 'login' => $username, 'password' => $password, 'userRoleId' => $role, 'active' => 1, 'created' => $date);
            $userId = $mySql->insert('users', $user)->getInsertId();
            $user = $mySql->getRecordById('users', $userId);
            $this->data['id'] = $userId;
            $this->data['record'] = $user;
        }
    }

?>