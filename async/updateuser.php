<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateUser_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract inputs
            $id = $this->_getPositiveInteger('id', $_params, false);
            $action = $this->_getString('action', $_params, false);
            $value = $this->_getString('value', $_params, false);
            
            $existuser = $mySql->getRecords('users', array('id' => $id));
            if (!$existuser) {
                throw new AsyncActionException('ЗАПИСЬ НЕ НАЙДЕНА!');
            }
            if ($action == 'name') {
                $mySql->update('users', array('name' => $value), array('id' => $id));
            }
            elseif ($action == 'login') {
                $userLoginExist = $mySql->select('*', 'users', array('login' => $value))->fetchAssoc();
                if (($userLoginExist['id'] !== $id)and($userLoginExist)) {
                    throw new AsyncActionException('Пользователь с таким ЛОГИНОМ уже существует!!!');
                }
                else{
                    $mySql->update('users', array('login' => $value), array('id' => $id));
                }
            }
            elseif ($action == 'email') {
                $userEmailExist = $mySql->select('*', 'users', array('email' => $value))->fetchAssoc();
                if (($userEmailExist['id'] !== $id) and ($userEmailExist)) {
                    throw new AsyncActionException('Пользователь с таким E-MAIL уже существует!!!');
                }
                else{
                    $mySql->update('users', array('email' => $value), array('id' => $id));
                }
            }
            elseif ($action == 'roleid') {
                $idRole = $mySql->select('id', 'userRoles', array('name' => $value))->fetchCellValue('id');
                $mySql->update('users', array('userRoleId' => $idRole), array('id' => $id));
            }
            elseif ($action == 'password') {
                $value = md5($value);
                $mySql->update('users', array('password' => $value), array('id' => $id));
            }
            elseif ($action == 'active') {
                $mySql->update('users', array('active' => $value), array('id' => $id));
            }
            
        }
        
    }

?>