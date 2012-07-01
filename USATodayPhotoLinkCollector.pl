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
		if ($isValid){ $mySelectedText .= $text; }
	}
      
	 #sub comment is not doing anything  
	sub comment {
		my ($self, $comment) = @_;
	}
      
	 #sub start will match <script language="javascript"> tag the set $isValid to true
	 #sub end will match </script> tag then set $isValid to false
	 #sub text will check $isValid, if true, concatenate parsed text
		 
	sub start {
		my ($self, $tag, $attr, $attrseq, $origtext) = @_;
		
		#if ($tag =~ /^script$/i && $attr->{'language'} =~ /^javascript$/i){
		#if ($attr->{'language'} =~ /^javascript$/i ){ 
		
	     ### Match  USA today's <script type="text/javascript">
		if ($tag =~ /^script$/i && $attr->{'type'} =~ /javascript$/i){ $isValid = 1; }
	}
      
	sub end {
		my ($self, $tag, $origtext) = @_; 
		if ($tag =~ /^script$/i) {$isValid = 0; }
	}

	open (TOFILE, ">usatoday.json") or die "file could not be created $!";
	my $photoSite = 'http://mediagallery.usatoday.com/';
	my $IP = IdentityParse->new(); # create instanc  of Identityparse	

	print "Processing site". $photoSite." \n"; 
	my $page = get($photoSite); #pass current url and get html page
	
	#IdentityParse will parse the page and return javascript codes,
	$IP->parse($page);
	
	# split the selectedtext into array on newline
	my @mySelectedText = split(/\n/,$mySelectedText);  

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

	print TOFILE '{"photos":[';	 
	# pattern of json  {"Name":null  ......."DateCaption":"6/7/2012"}]};
	# to use $1 you have to put regular expression in parentheses
	# matched value will be stored in $1.
	if($selectedLine =~ /({"Name":.*"}]})/){ print TOFILE $1; }		
	print TOFILE ']}';






