<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Put Users Image action
     *
     * @author Alexander Kudrya
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @created 2017.05.09
     */
    //! [2017.05.30] [Alexander Babayev]: Rename to 'SetUserImage'
    //! [2017.05.30] [Alexander Babayev]: Порефакторить...
    class Basic_PutUsersImage_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            // Extract inputs
            $userId = $this->_getString('userId', $_params, false, null);
            $filename = $this->_getString('filename', $_params, false, null);
            $uuId = $this->_getString('uuId', $_params, false, null);

            //take temp file path from the inputs
            $file = TMP_DIR_PATH.$uuId.'/'.$filename;

            if(file_exists($file))
            {
                //make new path...
                $newPath = UPLOADS_DIR_PATH.'/users/'.$uuId.'/'.$filename;

                //make new directory for file...
                mkdir(UPLOADS_DIR_PATH.'/users/'.$uuId);

                //move temp file to this path...
                rename($file, $newPath);

                //and remove temp directory
                rmdir(TMP_DIR_PATH.$uuId);
            }
            else
            {
                throw new AsyncActionException('Can not find file: '.$file);
            }

            //this string we will insert into DB->users->image
            $dbImageRecord = $uuId.'/'.$filename;

            $user = $mySql->getRecordById('users', $userId);

            //if user already have an image...
            if(!is_null($user['image']))
            {
                //delete old file
                unlink(UPLOADS_DIR_PATH.'/users/'.$user['image']);

                //and remove old directory
                $userImageParts = explode("/", $user['image']);
                $tmpDirName = $userImageParts[0];
                rmdir(UPLOADS_DIR_PATH.'/users/'.$tmpDirName);
            }

            $mySql->update('users', array('image' => $dbImageRecord), array('id' => $userId));

            $this->data['newPath'] = $newPath;
        }
    }
