<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Get MySQL NOW() value action
     *
     * @author Alexander Babayev
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.09.15
     */
    class Basic_GetMySqlNow_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $clientTimeZone = $this->_getString('timezone', $_params, false, null);
            $mySqlManager = Application::getService('basic.mysqlmanager');
            if (!is_null($clientTimeZone)) $mySqlManager->query('SET time_zone=\''.$clientTimeZone.'\'');
            $now = $mySqlManager->query('SELECT CURRENT_TIMESTAMP() AS `now`')->fetchCellValue('now');
            $this->data['now'] = $now;
        }
        
    }

?>