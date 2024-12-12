document.getElementById('checkoutForm').addEventListener('submit',function(event)
{
  event.preventDefault();

  document.getElementById('nameError').innerText="";
  document.getElementById('emailError').innerText="";
  document.getElementById('addressError').innerText="";
  document.getElementById('cityError').innerText="";

  let ErrorPresent=false;

  const name=document.getElementById('name').value.trim();
  const email=document.getElementById('email').value.trim();
  const address=document.getElementById('address').value.trim();
  const city=document.getElementById('city').value.trim();
  
  if(name==='' || name.length<7)
    {
      ErrorPresent=true;
      document.getElementById('nameError').innerText="Name field should be at least 7 characters";
    }
  if(email==='')
    {
      ErrorPresent=true;
      document.getElementById('emailError').innerText="Enter a Valid emial";
    }
  if(address==='' || address.length<10)
    {
      ErrorPresent=true;
      document.getElementById('addressError').innerText="Address field should be at least 10 characters";
    }    
  if(city==='' || city.length<3)
    {
      ErrorPresent=true;
      document.getElementById('cityError').innerText="City name should be at least 3 characters";
    }
  
  if(!ErrorPresent)
  {
    alert("Form submitted successfully");
    document.getElementById('checkoutForm').submit();
  }
});