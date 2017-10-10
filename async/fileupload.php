<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * File upload action
     *
     * @author Alexander Kudrya
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @created 2017.05.09
     */
    class Basic_FileUpload_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {


            require_once(LIBS_DIR_PATH.'fine-uploader/handler.php');

            $uploader = new UploadHandler();
//            $uploader->sizeLimit =  5 * 1024 * 1024;
            $uploader->inputName = "qqfile";

            $result = $uploader->handleUpload('tmp');
            $this->data['fileName'] = $uploader->getUploadName();
            $this->data['uuid'] = $result['uuid'];


        }
    }
?>