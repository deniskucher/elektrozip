<?php
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Update my password
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.12.08
     * @updated 2017.05.05 Alexander Kudrya
     */
    class Basic_UpdateMyPassword_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            
            // Ensure user is authorized
            $userId = empty($_SESSION['userId']) ? null : $_SESSION['userId'];
            if (!$userId) throw new AsyncActionException('You are not authorized to perform this action.');
            $user = $mySql->getRecordById('users', $userId);
            if (!$user) throw new AsyncActionException('User not found.');
            
            
            // Extract inputs
            $currentPassword = $this->_getString('currentPassword', $_params, true);
            if (md5($currentPassword) != $user['password']) throw new AsyncActionException('Wrong current password.');
            
            $newPassword = $this->_getString('newPassword', $_params, true);
            $retypeNewPassword = $this->_getString('retypeNewPassword', $_params, true);
            if ($newPassword != $retypeNewPassword) throw new AsyncActionException('New passwords do not match.');
            
            
            // Store new password
            $mySql->update('users', array('password' => md5($newPassword)), array('id' => $userId));
        }
        
    }

?>