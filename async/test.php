<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Test action
     *
     * @author Alexander Babayev
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2013.01.01
     */
    class Basic_Test_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            Application::getService('basic.logger')->log(LOGS_DIR_PATH.'test.log', 'Test');
            $this->data['date'] = $this->dateNow();
        }
        
    }

?>