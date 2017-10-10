<?php

// Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Set User Head action
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.22
     */

    class Basic_SetUserHead_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $userId = $this->_getString('id', $_params, true);
            //! [2017.05.30] [Alexander Babayev]: Use _getBoolean
            $val = $this->_getString('value', $_params, true);

            //validate condition value
            if($val != '1' && $val != '0')throw new AsyncActionException('Invalid Head value. Allowed values "1" or "0"');

            $mySql->update('users', array('head' => $val), array('id' => $userId));
        }
    }

