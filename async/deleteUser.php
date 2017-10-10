<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteUser_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $userId = $this->_getString('id', $_params, true);
            $mySql->delete('users', array('id' => $userId));
        }
    }
        

?>