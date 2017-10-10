<?php

    /**
     * Basic_GetMySqlConfig_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Get MySLQ config action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2016.02.18
     */
    class Basic_GetMySqlConfig_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            // Extract data
            $username = isset($_SESSION['MYSQL']['username']) ? $_SESSION['MYSQL']['username'] : MYSQL_USERNAME;
            //$password = isset($_SESSION['MYSQL']['password']) ? $_SESSION['MYSQL']['password'] : MYSQL_PASSWORD;
            $dbname = isset($_SESSION['MYSQL']['dbname']) ? $_SESSION['MYSQL']['dbname'] : MYSQL_DBNAME;
            
            // Store data in session
            $this->data['MYSQL']['dbname'] = $dbname;
            $this->data['MYSQL']['username'] = $username;
            //$this->data['MYSQL']['password'] = $password;
        }
        
    }

?>