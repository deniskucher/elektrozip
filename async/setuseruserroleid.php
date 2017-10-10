<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Set User Role action
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.22
     */
    class Basic_SetUserUserRoleId_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            //! [2017.05.30] [Alexander Babayev]: Use _getPositiveInteger
            $userId = $this->_getString('id', $_params, true);
            $val = $this->_getString('value', $_params, true);

            //validate condition value
            //! [2017.05.30] [Alexander Babayev]: Write proper message (Head -> userId)
            if($val < 1 || $val > 4)throw new AsyncActionException('Invalid Head value. Allowed between 1 and 4');

            $mySql->update('users', array('userRoleId' => $val), array('id' => $userId));

        }
    }

