//Programmed by ItzSelenux
async function showClipboardImage() 
{
	try 
	{
		const clipboardItems = await navigator.clipboard.read();
		for (const clipboardItem of clipboardItems) 
		{
			for (const type of clipboardItem.types) 
			{
				if (type === 'image/png') 
				{
					const blob = await clipboardItem.getType(type);
					const url = URL.createObjectURL(blob);
					const img = document.getElementById('clipboard-image');
					img.src = url;
				}
			}
		}
	}
	catch (err) {} //for some weird reason, this fix the extension
}

document.addEventListener('DOMContentLoaded', function()
{
	const button = document.getElementById('show-image');
	button.addEventListener('click', showClipboardImage);
});
