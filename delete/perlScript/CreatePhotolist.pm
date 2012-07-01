#!/usr/bin/perl
 use Cwd 'abs_path';
$dirtoget="C:\\Documents and Settings\\dshresth\\Desktop\\cover";

$fullpath;

opendir(IMD, $dirtoget) || die("Cannot open directory");

@thefiles= readdir(IMD);
closedir(IMD);

open (WRITESTREAM, '>photolist.xml');

  print WRITESTREAM "<photos>\n";
  
foreach $f (@thefiles)
{
 #unless ( ($f eq ".") || ($f eq "..") )
 if($f =~ /(.*)\.(jpg|jpeg)/)
 {

 print WRITESTREAM "<photo>\n";

   $fullpath = abs_path($f);
   $fullpath =~ s/\\/\//g;

  print WRITESTREAM "\t<name>"."file:///".$fullpath."</name>\n";
  print WRITESTREAM "</photo>\n";

 }
 
}

  print WRITESTREAM "</photos>";