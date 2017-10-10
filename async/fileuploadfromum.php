<?php

    // Load abstract action
           
            $data = array();
            $formats = array("jpg", "png", "gif", "bmp","jpeg","PNG","JPG","JPEG","GIF","BMP");
            $max_size = 2500000; 
            $format = @end(explode('.', $_FILES['img']['name']));
            $fileonserver = $_FILES['img']['tmp_name'];
            $dir = $_FILES['img']['name'].'_'.rand(0,999999).'_'.time();
 			$uploadimg = rand(0,999999).'_'.$_FILES['img']['name'];
            
                $error = false;
                // $files = array();
             
                $uploaddir = '../images/usersmanagerimg/'; // . - текущая папка где находится.php
             	
             	if(! is_dir( $uploaddir ) ) mkdir( $uploaddir, 0777 ); // Создадим папку если её нет
             	if (in_array($format, $formats)) {
             		
             		if (is_uploaded_file($_FILES['img']['tmp_name'])) {
             			if ($_FILES['img']['size'] > $max_size){
                            $response = 'File is too large';
                        }
                        else{
                            
                            if (move_uploaded_file($_FILES['img']['tmp_name'], $uploaddir.$uploadimg)) {
                                $resizeimg = compressImage($format,$uploadimg,900,$uploaddir, false);
                                $files = realpath( $uploaddir.$uploadimg);                            
                            }
                            else{
                                $errorupload = 'Ошибка загрузки файлов';
                            }
                        }
             		}

             	}
				else{
             			$invalidformat = 'Выберите правильный формат!';
             		}
                
                $thumbimg = compressImage($format,$uploadimg,100,$uploaddir, true);
                
                function compressImage($ext,$uploadedfile,$widththumb,$uploaddir,$prthumb)
                {

                    if($ext=="jpg" || $ext=="jpeg" )
                    {
                    $src = imagecreatefromjpeg($uploaddir.$uploadedfile);
                    }
                    else if($ext=="png")
                    {
                    $src = imagecreatefrompng($uploaddir.$uploadedfile);
                    }
                    else if($ext=="gif")
                    {
                    $src = imagecreatefromgif($uploaddir.$uploadedfile);
                    }
                    else
                    {
                    $src = imagecreatefrombmp($uploaddir.$uploadedfile);
                    }
                    
                    list($width,$height)=getimagesize($uploaddir.$uploadedfile);
                    // $newheight=($height/$width)*$widththumb;
                    $newheight=($height/$width)*$widththumb;
                    
                    if ($newheight>$widththumb) {
                        $paddingtop = ($newheight - $widththumb)/2;
                    }else{
                        $paddingtop = 0;
                    }
                       
                    if ($prthumb) {
                        $tmp0=imagecreatetruecolor($widththumb,$newheight);
                        imagecopyresampled($tmp0,$src,0,0,0,0,$widththumb,$newheight,$width,$height);
                        
                        $tmp=imagecreatetruecolor($widththumb,$newheight-2*$paddingtop);
                        imagecopyresampled($tmp,$tmp0,0,0,0,$paddingtop,$widththumb,$newheight,$widththumb,$newheight);

                        $thumbimg = 'thumb_'.$uploadedfile;
                        $adaptiveimage = $uploaddir.'thumb_'.$uploadedfile; //PixelSize_TimeStamp.jpg
                    }else{

                        $tmp=imagecreatetruecolor($widththumb,$newheight);
                        imagecopyresampled($tmp,$src,0,0,0,0,$widththumb,$newheight,$width,$height);
                        $thumbimg = $uploadedfile;
                        $adaptiveimage = $uploaddir.$uploadedfile;
                    }
                    
                    imagejpeg($tmp,$adaptiveimage,100);
                    imagedestroy($tmp);
                    // unlink($uploaddir.$uploadedfile);
                    return $thumbimg;
                }
                    $data = array('thumbimg'=>$thumbimg, 'uploadimg'=>$uploadimg, 'errorupload'=>$errorupload, 'invalidformat'=>$invalidformat, 'errorupload' => $errorupload);		
                 
                    echo json_encode( $data );
    
    

?>