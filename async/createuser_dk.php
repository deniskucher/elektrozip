<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_CreateUser_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			$flag = false;
            $nameErr = array();
            $loginErr = array();
            $emailErr = array();
            $passwordErr = array();
            $roleErr = array();
            $userExistErr = array();
            // Extract inputs
            $name = $this->_getString('name', $_params, false);
            $login = $this->_getString('login', $_params, false);
            $email = $this->_getString('email', $_params, false);
            $password = $this->_getString('password', $_params, false);
            $role = $this->_getString('role', $_params, false);
            $active = $this->_getString('active', $_params, false);
            
            if ($role) {
                $idRole = $mySql->select('id', 'userRoles', array('name' => $role))->fetchCellValue('id');
            }

            if (($name == null) or ($name == '*')) {
              $nameErr = array('inputname' => "Введите Имя!");
              $flag = true;  
            }

            if (($login == null) or ($login == '*')) {
              $loginErr = array('inputlogin' => "Введите Login!");
              $flag = true;  
            }
            else{
                $userLoginExist = $mySql->getRecords('users', array('login' => $login));
                if ($userLoginExist) {
                    $loginErr = array('login' => "Пользователь с таким логином уже существует!");
                    $flag = true;
                }
            }
            if ((!filter_var($email, FILTER_VALIDATE_EMAIL))or($email == null))
            {
               $emailErr = array('inputemail' =>  "Введите email корректно!"); 
               $flag = true;
            }
            else{
                $userEmailExist = $mySql->getRecords('users', array('email' => $email));
                if ($userEmailExist) {
                    $emailErr = array('email' =>  "Пользователь с таким e-mail уже существует!");
                    $flag = true; 
                }
            }
            if (($password == null) or ($password == '*')) {
              $passwordErr = array('inputpassword' => "Введите пароль!");
              $flag = true;  
            }
            if (($role == null) or ($role == '*')) {
              $roleErr = array('inputrole' => "Выберите роль!");
              $flag = true;  
            }
            
            $mess = array_merge($nameErr, $loginErr, $emailErr, $passwordErr, $roleErr, $userExistErr);
            $json = json_encode($mess);

            if ($flag) {throw new AsyncActionException($json);}
            else{
                $password = md5($password);
            $mySql->insert('users', array('name' => $name, 'email' => $email, 'login' => $login, 'password'=>$password, 'userRoleId' => $idRole));
            }
            
            
        }
    }
        

?>