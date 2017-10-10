<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Verify captcah action handler
     *
     * @author     Alexander Babayev
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since      3.0
     */
    class Basic_VerifyCaptcha_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $this->verifyCaptcha($_params);
        }
        
    }

?>