<?php

// Load abstract action
ClassLoader::loadAsyncActionClass('basic.abstract');

class Cart2_Appointcollector_AsyncAction extends Basic_Abstract_AsyncAction
{

    /**
     * Performs the action
     */
    public function perform(array $_params = array())
    {
        $mySql = Application::getService('basic.mysqlmanager');

        $orderId = $this->_getPositiveInteger('order_id', $_params, true);
        $userId = (int)$this->_getPositiveInteger('collector_id', $_params, true);

        if ($mySql->count('orders', "`collector_id` IS NOT NULL AND `id` = {$orderId}"))
            throw new AsyncActionException('Для этого заказа сборщик уже был назначен.');
        $product = $mySql->update('orders', array('collector_id' => $userId), array('id' => $orderId));
        if (!$mySql->getAffectedRows())
            throw new AsyncActionException('Сборик не назначен.');
    }

}

?>