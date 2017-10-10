<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set product name
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.07.26
     */
    class Basic_SetUserUsername_AsyncAction extends Basic_Abstract_AsyncAction
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
            $username = $this->_getString('value', $_params, true);

            //! [2017.05.30] [Alexander Babayev]: Why? Reason?
            if (strlen($username) < 4) throw new AsyncActionException('Login is too short, there must be at least 4 characters!');

            // Check username uniqueness
            $checkUser = $mySql->count('users', array('login' => $username));
            if ($checkUser != 0) throw new AsyncActionException('Login already exists.');
            
            // Update record
            $mySql->update('users', array('login' => $username), array('id' => $id));
        }
        
    }

?>