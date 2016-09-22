<?php

    /**
     * Cart_OrderManagerHtmlDocument_Model class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load basic HTML document model class
    ClassLoader::loadModelClass('basic.abstracthtmldocument');
    
    
    /**
     * Order manager HTML document model
     *
     * @author Alexander Babayev
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.16
     * @updated 2015.09.25 Added storage mode option
     */
    class Cart2_OrderManagerHtmlDocument_Model extends Basic_AbstractHtmlDocument_Model
    {
        
        /**
         * @var boolean Storage mode indicator
         */
        public $storage = false;

        public $user = null;

        public $testMode = null;

    }

?>