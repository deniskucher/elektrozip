<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Get Result Orders Status action
     *
     * @author Denis Kucher <dkucher88@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.06.18
     *
     * INFO:
     * response array must have a 'records' key (for select input field)
     *
     */
    
    class Basic_GetResultOrders_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        private $result = array(
            'СДЕЛКА' => 'СДЕЛКА',
            'ОТМЕНА' => 'ОТМЕНА',
            'ТАЙМАУТ' => 'ТАЙМАУТ',
        );


        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $this->data['records'] = $this->result;
        }

    }

?>