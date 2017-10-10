<?php

    /**
     * Basic_SetMySqlConfig_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set MySLQ config action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @since 2016.02.18
     */
    class Basic_SetMySqlConfig_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            // Extract and validate password
            $dbname = isset($_params['dbname']) ? $_params['dbname'] : '';
            $username = isset($_params['username']) ? $_params['username'] : '';
            $password = isset($_params['password']) ? $_params['password'] : '';
            
            // Store data in session
            $_SESSION['MYSQL']['dbname'] = $dbname;
            $_SESSION['MYSQL']['username'] = $username;
            $_SESSION['MYSQL']['password'] = $password;
        }
        
    }

?>