case "$1" in
  tanvir)
    git config --local user.name "Tamajose"
    git config --local user.email "tnvrmh41@gmail.com"
    ;;
  farhan)
    git config --local user.name "FarhanIshraq24"
    git config --local user.email "farhanishraq987@gmail.com"
    ;;
  *)
    echo "Usage: $0 {tanvir|farhan}"
    exit 1
    ;;
esac

echo "Switched git identity to:"
git config --local user.name
git config --local user.email