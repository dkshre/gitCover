#!/usr/bin/perl
use LWP::Simple;
#use Data::Dumper;
use HTML::TreeBuilder;
#use HTML::Element;
use HTML::Entities;


open (TOFILE, ">PhotoIndex.xml") or die "file could not be created $!";

sub getBBCMundoPhotoURLs{
	 $page = get("http://www.bbc.co.uk/mundo/video_fotos");
	 #die "Couldn't get it!" unless defined $page;

	  my $tree = HTML::TreeBuilder->new->parse($page); # make a tree structure
	   #$tree = HTML::TreeBuilder->new->parse_file( "bbc\\video_fotos.htm" );
	  
	my $anchor = $tree->look_down('_tag'=> 'li', 'class'=>'');
	$anchor = $anchor->look_down('_tag'=> 'ul');
	my @photoSites;
	foreach $item ($anchor->look_down( '_tag'=>'li')){
		# ADD ELEMENTS
		push(@photoSites, 'http://www.bbc.co.uk'. $item->look_down('_tag','a')->attr('href'));
		  #print  $item->look_down('_tag','a')->attr('href'), "\n" ;
		 # print  $item->look_down('_tag','a')->as_text, "\n\n";
		  #$photoLibrary{$item->look_down('_tag','a')->attr('href')} = $item->look_down('_tag','a')->as_text;
	}				
	return @photoSites;
}

sub getBBCPhotoURLs{
	 $page = get("http://www.bbc.co.uk/news/in_pictures/");
	 #die "Couldn't get it!" unless defined $page;

	  my $tree = HTML::TreeBuilder->new->parse($page); # make a tree structure
	  # $tree = HTML::TreeBuilder->new->parse_file( "bbc\\BBC News - In Pictures.htm" );
	  my @photoSites;
	  
	  #<div id="now" class="container-now"> 
	my $anchor = $tree->look_down(_tag=> 'div', id=>'now', class=>'container-now');

	#<div class="lead-feature-now">  get the featured item
	my $anchor1 = $tree->look_down(_tag=>'div', class=>'lead-feature-now');
	push(@photoSites, 'http://www.bbc.co.uk'. $anchor1->look_down('_tag','a')->attr('href'));
	

	foreach $item ($anchor->look_down( _tag=>'div', class=>'guide')){
		push(@photoSites, 'http://www.bbc.co.uk'. $item->look_down('_tag','a')->attr('href'));
		#<span class="summary">
		#print  $item->look_down(_tag =>'span', class=>'summary')->as_text, "\n\n";
	}
	
	$tree->delete; $anchor->delete; $anchor1->delete;
	return @photoSites;
}


	my @photoSiteArray = getBBCPhotoURLs;
	while( scalar @photoSiteArray > 2) { pop(@photoSiteArray);} # keep only first two
	push(@photoSiteArray, getBBCMundoPhotoURLs);
	while( scalar @photoSiteArray > 4) { pop(@photoSiteArray);} #keep only first two

	print TOFILE '<?xml version="1.0" encoding="ISO-8859-1"?>';
	print TOFILE "\n<root>\n";	
	
	foreach (@photoSiteArray) {

		if ( $_ =~ /http:\/\/www\.bbc\.co\.uk\/news/){
			#print "$_", "\nEnglish\n";
			print "English site current Index $current_index :\n URL: $_ \n";
			$current_index++; 

			$page = get($_); #pass current url
			my $tree = HTML::TreeBuilder->new->parse($page); # build tree for that page
			#$tree = HTML::TreeBuilder->new->parse_file( "bbc\\120305_galeria_fotos_bonsai_arte_jrg.shtml" );
	 
			# <div id="pictureGallery">
			my $anchor = $tree->look_down(_tag=>'div', id=>'pictureGallery');

			#get the H1 of the page and assign to topic local variable
	#		my $topic= $tree->look_down('_tag'=>'h1')->as_text , "\n\n";
	   #get the H1 of the page and assign to topic local variable
			print TOFILE '<photos topic="'.encode_entities($tree->look_down('_tag'=>'h1')->as_text,'`&\'`"').'" location="BBC English">';

			my $numberOfPhotos = 0;

			foreach $item ($anchor->look_down(_tag=>'li')){
				$numberOfPhotos++;
				print TOFILE "\n<photo>\n";
				print TOFILE "\t<path>", $item->look_down('_tag','a')->attr('href'),"</path>\n";
				# <span class="picGalCaption">
				print TOFILE "\t<caption>", encode_entities($item->look_down('_tag'=>'span', 'class'=>'picGalCaption')->as_text,'`&\'`"') ,"</caption>\n";
				print TOFILE "</photo>\n"; 
			}
			print "\tNumber of photos for this site : $numberOfPhotos\n\n";
			print TOFILE "</photos>\n";		
		}
		else {
			#print "$_", "Spanish\n";
			#print "Processing current Index $current_index :\n $_ \n";
			print "Spanish site current Index $current_index :\n URL: $_ \n";
			$current_index++; 
	  
			$page = get($_); #pass current url
			my $tree = HTML::TreeBuilder->new->parse($page); # build tree for that page
			# $treex->parse_file("bbc\\samplehtmldump.html");
			#$tree = HTML::TreeBuilder->new->parse_file( "bbc\\120305_galeria_fotos_bonsai_arte_jrg.shtml" );
			# $treex->parse($page);
	   
			my $anchor = $tree->look_down('_tag'=>'div',  'class'=>'g-container fw-story-body'); 
			my $numberOfPhotos = 0;
			if (defined $anchor){
				#get the H1 of the page and assign to topic local variable
				#my $topic= $tree->look_down('_tag'=>'h1')->as_text , "\n\n";
	   
				print TOFILE '<photos topic="'.encode_entities($tree->look_down('_tag'=>'h1')->as_text, '`&\'`"').'" location="BBC spanish">';		
				#$anchor->dump;
				foreach $item ($anchor->look_down('class'=>'content')){
					$numberOfPhotos++;
					print TOFILE "\n<photo>\n";
					print TOFILE "\t<path>", $item->look_down('_tag','a')->attr('href'),"</path>\n";
					print TOFILE "\t<caption>", encode_entities($item->look_down('_tag'=>'div', 'class'=>'body')->as_text,'`&\'`"') ,"</caption>\n";
					print TOFILE "</photo>\n";
					#print $item->dump;
				}
			print "Number of photos for this site : $numberOfPhotos\n\n";
			print TOFILE "</photos>\n";
			}
		}
	}

print TOFILE "\n</root>\n";

