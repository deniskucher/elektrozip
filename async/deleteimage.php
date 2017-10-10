<?php
 
     
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteImage_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $image = $this->_getString('img', $_params, false);
            $thumb = $this->_getString('thumb', $_params, false);
            $id = $this->_getPositiveInteger('id', $_params, false);
            
            $mySql->update('users', array('image' => '', 'image_thumb' => ''), array('id' => $id));
            
            @unlink($image);
            @unlink($thumb);
            
        }
    }

?>