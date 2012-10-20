#!/usr/bin/perl

use strict;

package IdentityParse;
use base "HTML::Parser";
use LWP::Simple;  
use HTML::TreeBuilder;
	   
	my $isValid = 0;
	my $mySelectedText;
	  
	sub text {
		my ($self, $text, $tag) = @_;
		if ($isValid){
			$mySelectedText .= $text;
		}
	}
      
	sub comment {
		my ($self, $comment) = @_;
	}
      
	 #sub start will match <script language="javascript"> tag the set $isValid to true
	 #sub end will match </script> tag then set $isValid to false
	 #sub text will check $isValid, if true, concatenate paresed text
	 #sub comment is not doing anything
	 
	sub start {
		my ($self, $tag, $attr, $attrseq, $origtext) = @_;
		if ($tag =~ /^script$/i && $attr->{'language'} =~ /^javascript$/i){
			#if ($attr->{'language'} =~ /^javascript$/i ){ 
				$isValid = 1; 
			#}
		}
	}
      
	sub end {
		my ($self, $tag, $origtext) = @_; 
		if ($tag =~ /^script$/i){
			$isValid = 0; 
		}
	}

open (TOFILE, ">yahoo.json") or die "file could not be created $!";

sub getPhotoURLs{
	my $page = get("http://news.yahoo.com/photos/");
	die "Couldn't get it!" unless defined $page;

	my $tree = HTML::TreeBuilder->new->parse($page); # make a tree structure  
	#my $anchor = $tree->look_down('_tag'=> 'div', 'id'=>'featured-galleries');
	
	#    <div class="yui3-bcarousel yui3-scrollview tpl-tile no-cite">
    my $anchor = $tree->look_down('_tag'=> 'div', 'class'=>'yui3-bcarousel yui3-scrollview tpl-tile no-cite');

    #    <ul class="bcarousel-items">
    $anchor= $anchor->look_down( '_tag'=>'ul', 'class'=>'bcarousel-items');
	
	my @photoSites;
	foreach my $item ($anchor->look_down( '_tag'=>'li')){
		# ADD ELEMENTS
		push(@photoSites, 'http://news.yahoo.com'. $item->look_down('_tag','a')->attr('href'));
		# print  $item->look_down('_tag','a')->attr('href'), "\n" ;
	}				
	return @photoSites;
}
#call sub getPhotoURLs and populate @photoSiteArray 
my @photoSiteArray = getPhotoURLs;

#while(scalar @photoSiteArray > 2){  pop(@photoSiteArray);}

my $current_index = 0; 

print TOFILE '{"photos":[';

my $IP = IdentityParse->new(); # create instanc  of Identityparse	

foreach (@photoSiteArray) { 
	print "Processing current Index $current_index :\n $_ \n";
	$current_index++; 
	 
	my $page = get($_); #pass current url and get html page

	#$tree = HTML::TreeBuilder->new->parse_file( "bbc\\120305_galeria_fotos_bonsai_arte_jrg.shtml" );
	# $treex->parse($page);	
	#IdentityParse->new->parse($page);

	$IP->parse($page);
	
	my @mySelectedText = split(/\n/,$mySelectedText);  
	  #print  $_,  foreach(@mySelectedText);

	#IdentityParse parser will return javascript codes,
	#Assumption: the longest line will have all the information we need.

	#After for loop, the longest line will be stored in selectedLine.
  	my $selectedLength = 0; 
	my $selectedLine = 0;;
	foreach my $curLine (@mySelectedText){
		if (length($curLine) > $selectedLength){
			$selectedLength = length($curLine);
			$selectedLine = $curLine;
		}	 
	}
	
	#Regular expression is used to extract part of the line.
	if ($selectedLine =~ /({"items":{.*"]})/){
		print TOFILE $1;
	}	
	print TOFILE ',';	 
	$mySelectedText = "";
	$page= "";
}
print TOFILE ']}';






