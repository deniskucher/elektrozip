<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Get users action
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.04.27
     *
     * INFO:
     * response array must have a 'records' key (for select input field)
     *
     */
    //! [2017.05.30] [Alexander Babayev]: Rename to 'GetUserRoles'
    class Basic_GetRolesUsers_AsyncAction extends Basic_Abstract_AsyncAction
    {
        //! [2017.05.30] [Alexander Babayev]: Порефакторить...
        private $roles = array(
            1 => 'Administrator',
            2 => 'Tour Operator',
            3 => 'Sales Manager',
            4 => 'Operating Officer',
        );


        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $this->data['records'] = $this->roles;
        }

    }

?>