<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set User name
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.09
     */
    class Basic_SetUserName_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract inputs
            $id = $this->_getPositiveInteger('id', $_params, true);
            if ($mySql->count('users', array('id' => $id)) == 0) throw new AsyncActionException('User record not found.');
            $name = $this->_getString('value', $_params, true);

            //validate condition value
            //! [2017.05.30] [Alexander Babayev]: Я знаю именя и из двух букв... :)
            if(strlen($name) < 4)throw new AsyncActionException('Name length must be more than 3 characters');
            
            // Update record
            $mySql->update('users', array('name' => $name), array('id' => $id));
        }
        
    }

?>