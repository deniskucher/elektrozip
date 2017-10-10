<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * File upload action
     *
     * @author Alexander Babayev
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.11.10
     */
    class Basic_FileUploadSid_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            //error_reporting(E_ERROR);
            require_once(PLUGINS_DIR_PATH.'valums-file-uploader/server/php.php');
            $allowedExtensions = array(); //$allowedExtensions = array('pdf', 'txt');
            $sizeLimit = 5 * 1024 * 1024;
            $uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
            
            $sid = md5(session_id());
            $tmpDirPath = TMP_DIR_PATH.$sid.'/';
            if (!file_exists($tmpDirPath))
                mkdir($tmpDirPath);
            
            $result = $uploader->handleUpload($tmpDirPath, true);
            if (array_key_exists('error', $result))
                throw new AsyncActionException($result['error']);
            //$this->data['filename'] = $uploader->getName();
        }
        
    }

?>