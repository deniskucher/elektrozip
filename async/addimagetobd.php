<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_AddImagetoBD_AsyncAction extends Basic_Abstract_AsyncAction
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
            $imageway = 'application/modules/basic/images/usersmanagerimg/'.$image;
            $thumbway = 'application/modules/basic/images/usersmanagerimg/'.$thumb;
            
            $usersdata = $mySql->select('*', 'users', array('id' => $id))->fetchAssoc();
            $mySql->update('users', array('image' => $imageway, 'image_thumb' => $thumbway), array('id' => $id));
            
            @unlink($usersdata['image']);
            @unlink($usersdata['image_thumb']);

            $this->data['img'] = $imageway;
            $this->data['thumb'] = $thumbway;
            
        }
    }
        

?>