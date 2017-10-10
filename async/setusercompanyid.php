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

    class Basic_SetUserCompanyId_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $userId = $this->_getString('id', $_params, true);
            //! [2017.05.30] [Alexander Babayev]: Use _getPositiveInteger
            $val = $this->_getString('value', $_params, true);

            //validate condition value
            //! [2017.05.30] [Alexander Babayev]: Write proper comments (Head -> company ID)
            if(!is_numeric($val))throw new AsyncActionException('Invalid Head value. Allowed values only numeric type');
            $val = (int)$val;

            $mySql->update('users', array('companyId' => $val), array('id' => $userId));

        }
    }

