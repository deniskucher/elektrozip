<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Get Status Oders action
     *
     * @author Denis Kucher <dkucher88@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.06.18
     *
     * INFO:
     * response array must have a 'records' key (for select input field)
     *
     */
    
    class Basic_GetStatusOrders_AsyncAction extends Basic_Abstract_AsyncAction
    {
        private $status = array(
            'ОФОРМЛЕНИЕ' => 'ОФОРМЛЕНИЕ',
            'ОТКРЫТ' => 'ОТКРЫТ',
            'ЗАКРЫТ' => 'ЗАКРЫТ',
            'СБОРКА' => 'СБОРКА',
            'ОПЛАТА' => 'ОПЛАТА',
            'ОТПРАВКА' => 'ОТПРАВКА',
            'ДОСТАВКА' => 'ДОСТАВКА',
            'НЕДОБОР' => 'НЕДОБОР',
            'ПЕРЕГОВОРЫ' => 'ПЕРЕГОВОРЫ',
            'ОТЗЫВ' => 'ОТЗЫВ',
            'КОРЗИНА' => 'КОРЗИНА',
        );


        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $this->data['records'] = $this->status;
        }

    }

?>