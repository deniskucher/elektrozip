<?php

    /**
     * Basic_CreateUser_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


/**
 * Check Login Unique action
 *
 * @author Alexander Kudrya <alexkudrya91@gmail.com>
 * @copyright Copyright &copy; 2017
 * @created 2017.05.27
 */
    //! [2017.05.30] [Alexander Babayev]: Переименовать медот. Над названием еще подумаю...
    class Basic_CheckLoginUnique_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            // Extract inputs
            $value = $this->_getString('value', $_params, true);


            // Check username uniqueness
            $checkUser = $mySql->count('users', array('login' => $value));
            if ($checkUser != 0) {
                $this->data['data'] = false;
            }
            else
            {
                $this->data['data'] = true;
            }
        }
    }

?>