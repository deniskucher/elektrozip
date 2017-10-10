<?php

    /**
     * Basic_UpdateUserAvatar_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Update user avatar action handler
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.07.17
     */
    class Basic_UpdateUserAvatar_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySqlManager = Application::getService('basic.mysqlmanager');
            
            
            // Extract user ID
            $userId = $this->_getPositiveInteger('userId', $_params, true);
            $user = $mySqlManager->select('*', 'users', array('id' => $userId))->fetchAssoc();
            if (!$user) throw new AsyncActionException('User not found.');
            
            // Extract and validate filename
            $allowedExtensions = array('png', 'jpg', 'gif', 'jpeg');
            $filename = isset($_params['filename']) ? trim($_params['filename']) : null;
            if (empty($filename))
                throw new AsyncActionException('Please upload a file.');
            $tmp = explode('.', $filename);
            $ext = strtolower(end($tmp));
            if (!in_array($ext, $allowedExtensions))
                throw new AsyncActionException('File type should be one of: '.implode(',', $allowedExtensions).'.');
            $tmpFilePath = TMP_DIR_PATH.$filename;
            if (!file_exists($tmpFilePath))
                throw new AsyncActionException('Uploaded file is not found on server. Please re-upload.');
            
            
            // Process uploaded image
            require(LIBS_DIR_PATH.'simpleimage.php');
            $simpleImage = new SimpleImage();
            $simpleImage->load($tmpFilePath);
            $simpleImage->resizeToFitAndCrop(75, 75);
            $simpleImage->save($tmpFilePath);
            
            
            // Renew avatar
            $rnd = uniqid();
            $avatarFilename = $userId.'-avatar-'.$rnd.'.'.$ext;
            if (copy($tmpFilePath, UPLOADS_DIR_PATH.'users/'.$avatarFilename) === false) throw new AsyncActionException('Failed to copy uploaded file.');
            
            $liveChat = Application::getService('livechat.livechat');
            $liveChat->updateOperator($userId, array('avatar' => $avatarFilename));
            
            if (!empty($user['avatar']))
            {
                $oldAvatarFilePath = UPLOADS_DIR_PATH.'users/'.$user['avatar'];
                if (file_exists($oldAvatarFilePath)) unlink($oldAvatarFilePath);
            }
            unlink($tmpFilePath);
        }
        
    }

?>