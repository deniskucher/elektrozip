<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_CheckoutOrder_AsyncAction extends Basic_Abstract_AsyncAction
    {
        public function perform(array $_params = array()){
            $fio = array();
            $phone = array();
            $flag = false;
            $mySql = Application::getService('basic.mysqlmanager');
            $name = $this->_getString('name', $_params, false);
            $email = $this->_getString('email', $_params, false);
            $telephone = $this->_getString('phone', $_params, false);
            $orderId = $this->_getString('orderid', $_params, false);
                        
            $cartFromMail = $mySql->select('value', 'settings', array('key' => 'CART_FROM_MAIL'))->fetchCellValue('value');
            $cartBccMail = $mySql->select('value', 'settings', array('key' => 'CART_BCC_MAIL'))->fetchCellValue('value');
            $cartOperatorMail = $mySql->select('value', 'settings', array('key' => 'CART_OPERATOR_MAIL'))->fetchCellValue('value');

            if ($name == null) {
              $fio = array('fio' => "Введите Имя");
              $flag = true;  
            };
            
            if ((!preg_match("/^[0-9-]+$/",$telephone)) && (!filter_var($email, FILTER_VALIDATE_EMAIL)))
            {
               $phone = array('phone' =>  "Введите коррекотно телефон либо email"); 
               $flag = true;
            }
           
            $mess = array_merge($fio, $phone);
            $json = json_encode($mess);
            
            if ($flag) throw new AsyncActionException($json);
            
            if ($email) {
                
                // $email = 'NULL';
                $client_id = $mySql->select('id', 'clients', array('email' => $email))->fetchCellValue('id');

            }
            elseif ($telephone) {
                $email = 'NULL';
                $client_id = $mySql->select('id', 'clients', array('phone' => $telephone))->fetchCellValue('id');
            }
            if ($telephone == null) $telephone = 'NULL';
            if(!$client_id) 
            { 
            
                $mySql->insert('clients', array('name' => $name, 'email' => $email, 'phone' => $telephone, 'sales_channel'=>'Сайт: Корзина'));          
                $client_id = $mySql->getInsertId();
            }
                                  
            $change_id_orders =  $mySql->update('orders', array('client_id' => $client_id, 'status' => 'ОФОРМЛЕНИЕ'), array('id' => $orderId));
            

            $usdRate = $mySql->select('usdRate', 'orders', array('id' => $orderId))->fetchCellValue('usdRate');
            $subjectUser = "ElektroZip: Ваш заказ (".date("d.m.Y H:i").")"."\r\n";
            $subjectOperator = "ElektroZip: Заказ №".$orderId." : ".$name." (".date("d.m.Y H:i").")"."\r\n";
            
            if ($email == 'NULL') {
                $email = $mySql->select('email', 'clients', array('phone' => $telephone))->fetchCellValue('email');
            }
            if ($telephone == 'NULL') {
                $telephone = $mySql->select('phone', 'clients', array('email' => $email))->fetchCellValue('phone');
            }
            //$order['items'] = $mySql->select('*', 'orderitems', array('orderId' => $orderId))->fetchAll();
            $order['items'] = $mySql->query(
                "SELECT `orderItems`.*, IFNULL(`sort`.`code`, `orderItems`.`code`) AS `order_code` FROM `orderItems`"
                ."LEFT JOIN `orderItems` as `sort` ON `orderItems`.`alternative_for_id`=`sort`.`id`"
                ."WHERE `orderItems`.`orderId` = {$orderId} ORDER BY `order_code` ASC, `orderItems`.`alternative_for_id` ASC, `orderItems`.`added` ASC"
            )->fetchAll();

            foreach ($order['items'] as &$item){
                
                $mail.= "<tr><td>".$item['code']."</td><td>".$item['name']."</td>";
                $mail.= "<td>$".number_format($item['price'],2,'.', '')." (".number_format(($item['price']*$usdRate),2,'.', '')." грн)</td><td>".$item['requiredQuantity']."шт.</td><td>$".number_format($item['price']*$item['requiredQuantity'],2,'.', '')." (".number_format($item['price']*$item['requiredQuantity']*$usdRate,2,'.', '')." грн)</td></tr>";
                $sumua += number_format(($item['price']*$usdRate*$item['requiredQuantity']),2,'.', '');
                
                $sumusd += number_format(($item['price']*$item['requiredQuantity']),2,'.', '');
            }
            
            $head = "<tr><th>Код товара</th><th>Наименование</th><th>Цена</th><th>Кол-во</th><th>Сумма</th></tr>";
            
            $template = "<html>
            <body>
            <h1>".$subjectUser."</h1>
            <div><h3>Имя: ".$name."</h3></div>
            <div><h3>Телефон: ".$telephone."</h3></div>
            <div><h3>E-mail: ".$email."</h3></div>
            <div><h3>Курс доллара: ".$usdRate."</h3></div>
            <table><tbody>
            ".$mail."</tbody></table></body>
            <div><h3>Итого: $".$sumusd." (".$sumua." грн)<h3></div>
            </html>";
            $template = str_replace ( "<table>" ,"<table style='border:1px solid black; border-collapse: collapse;'>".$head, $template);
            $template = str_replace ( "<th>" ,"<th style='border:1px solid black;background: #999; padding: 5px;'>", $template);
            $template = str_replace ( "<td>" ,"<td style='border:1px solid black; padding: 5px;'>", $template);
            $template .= '<hr>' .Viewer::resolveUrl('');
            $domain = "elektrozip-demo.com";

            $from = "zakaz@". $_SERVER['HTTP_HOST'];
            $headers = "From: ElektroZip <".$cartFromMail. ">\r\n";
            $headers .= "Reply-To: ". $from . "\r\n";
            $headers .= "Bcc: ". $cartBccMail . "\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $to = $email;
            #$to .= ",ki11a_88@mail.ru";
            $successUser = mail($to, $subjectUser, $template, $headers);

            $fromOper = $email;
            $headersOperator = "From: ElektroZip <".$cartFromMail. ">\r\n";
            $headersOperator .= "Bcc: ". $cartBccMail . "\r\n";
            $headersOperator .= "MIME-Version: 1.0\r\n";
            $headersOperator .= "Content-Type: text/html; charset=UTF-8\r\n";
            
            $templateOper = "<html>
            <body>
            <h1>".$subjectOperator."</h1>
            <div><h3>Имя: ".$name."</h3></div>
            <div><h3>Телефон: ".$telephone."</h3></div>
            <div><h3>E-mail: ".$email."</h3></div>
            <div><h3>Курс доллара: ".$usdRate."</h3></div>
            <table><tbody>
            ".$mail."</tbody></table></body>
            <div><h3>Итого: $".$sumusd." (".$sumua." грн)<h3></div>
            </html>";
            $templateOper = str_replace ( "<table>" ,"<table style='border:1px solid black; border-collapse: collapse;'>".$head, $templateOper);
            $templateOper = str_replace ( "<th>" ,"<th style='border:1px solid black;background: #999; padding: 5px;'>", $templateOper);
            $templateOper = str_replace ( "<td>" ,"<td style='border:1px solid black; padding: 5px;'>", $templateOper);
            
            $successOperator = mail($cartOperatorMail, $subjectOperator, $templateOper, $headersOperator);
        }
                
    }

?>