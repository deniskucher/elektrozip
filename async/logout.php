<?php

    /**
     * Basic_Logout_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Logout action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @created 2014.05.21
     * @updated 2016.12.08 Login with username and password
     */
    class Basic_Logout_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            if (isset($_SESSION['userId'])) unset($_SESSION['userId']);
        }
        
    }

?>