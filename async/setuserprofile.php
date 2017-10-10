<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set User Profile
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.09
     */
    //! [2017.05.30] [Alexander Babayev]: Rename to 'UpdateUser'
    class Basic_SetUserProfile_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract inputs
            $id = $this->_getPositiveInteger('id', $_params, true);
            if ($mySql->count('users', array('id' => $id)) == 0) throw new AsyncActionException('User record not found.');
            $name = $this->_getString('name', $_params, true);
            $username = $this->_getString('username', $_params, false);
            if($username != '')
            {
                if ($mySql->count('users', array('login' => $username)) != 0) throw new AsyncActionException('Account with this Login already exist.');
            }
            // Update record
            if($username != '')
            {
                $mySql->update('users', array('name' => $name, 'login' => $username), array('id' => $id));
            }
            else
            {
                $mySql->update('users', array('name' => $name), array('id' => $id));
            }
        }
        
    }

?>