<?php

    /**
     * Basic_Abstract_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadCoreClass('action');
    
    
    /**
     * Abstract asyncronous action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 3.1
     */
    abstract class Basic_Abstract_AsyncAction extends Action
    {
    
        /**
         * @var array Data
         */
        protected $data = array();
        
        
        /**
         * @var array Errors
         */
        protected $errors = array();
        
    
        /**
         * @var string Redirect URL
         */
        protected $redirectUrl = null;
        
    
        /**
         * Performs the action
         * @param Request Request object
         */
        abstract public function perform(array $_params = array());
        
        
        /**
         * Accesses the data
         * @return array Data
         */
        public function getData() { return $this->data; }
        
        
        /**
         * Accesses the errors
         * @return array Errors
         */
        public function getErrors() { return $this->errors; }
        
        
        /**
         * Accesses the redirect URL
         * @return string Redirect URL
         */
        public function getRedirectUrl() { return $this->redirectUrl; }
        
    }

?>