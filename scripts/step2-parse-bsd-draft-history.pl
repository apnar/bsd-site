#!/usr/bin/perl
use Data::Dumper;
use Math::Round;

my $look = $ARGV[0]; 
chomp $look;

$look = "AA";

open (FILE, 'draft-mapping-fix.csv');

my %namefix;
my %data;

my @recentSeasons = ("S25", "F24", "S24","F23","U23","S23");
my @rdoSeasons = ("S25","F24","S24","F23","U23","S23","F22","S22","F21","S21","F20","S20","F19","U19","S19");
my @divisions = ("AA", "A", "ABA", "ABB", "BBB", "BB");

while(my $line = <FILE>) {
  $line =~ s/\s*\z//;
  ($bad, $good) = split("\",", $line);
  $bad .= '"';
  $namefix{$bad} = $good;
}

close (FILE);

open (FILE, 'draft.csv');

while(my $line = <FILE>) {
  $line =~ s/\s*\z//;
  ($name, $drafts) = split("\",",$line);
  $name .= '"';
  my @list=split(" ",$drafts);
  my $select='';
  print "-- $name --\n";
  if(exists($namefix{$name}))
  {
    print "found name fix, changing $name to $namefix{$name}\n";
    $name = $namefix{$name};
  }
  foreach(@list)
  {
    my $season = substr($_,0,3,"");
    my $round = substr($_,-2,1,"");
    substr($_,-2,2,"");
    my $div = $_;

    #$select="$select,\"$round\"" if($div eq  $look);
 
    #print "$name -- $season -- $round -- $div\n";
    my @pair = ($div,$round);
    $data{$name}->{$season} = \@pair; 

  }
  #print "select: $select\n";
  #print "$name,\"\",\"\"$select\n" if($select ne '');
}

close (FILE);

for my $i (0 .. $#divisions)
{
  my $filename = "bsd-draft-$divisions[$i].csv";
  open(FH, '>', $filename) or die $!;
  foreach my $name (keys %data) {
    my $count = 0;
    my $total = 0;
    foreach (@recentSeasons) {
      my $s = $_;
      my $check = $data{$name}{$s}[0];
      print " checking in $s if $check is $divisions[$i]\n";
      # check normal division
      if($data{$name}{$_}[0] eq $divisions[$i]) {



        $count += 1;
        $total += $data{$name}{$_}[1];
   #     print "  found level\n";
      }
      # check one better
      if($i > 0){
        if($data{$name}{$_}[0] eq $divisions[$i-1]) {
          $count += 1;
   #       print "  found better\n";
        }
      }
      # check one worse
      if($i < $#divisions) {
        if($data{$name}{$_}[0] eq $divisions[$i+1]) {
          $count += 1;
          $total += 9;
    #      print "  found worse\n";
        }
      }
    } 
    if ($count > 0)
    {
      my $score = nearest(.1, $total/$count);
      print "$name -- $divisions[$i] -- $count -- $total -- $score\n";
      print FH "$name,\"\",\"$score\"\n";
    }
  } 

  close (FH); 
  print "$divisions[$i]\n";
}

  my $filename = "bsd-draft-rdo.csv";
  open(FH, '>', $filename) or die $!;
  foreach my $name (keys %data) {
    foreach (@rdoSeasons) {
      my $s = $_;
      my $check = $data{$name}{$s}[0];
      print "$name checking in $s if $check exists\n";
      if($data{$name}{$s}[0]) {
         my ($index) = grep { $divisions[$_] ~~ $data{$name}{$s}[0] } 0 .. $#divisions;
         $index = $index +1; 
         print FH "$name,\"\",\"\",\"$index.$data{$name}{$s}[1]\"\n";
         last;
      }
    }
  }
  close (FH); 



#print Dumper(\%data);

exit;


